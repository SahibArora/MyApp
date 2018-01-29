       var HTTP_PORT = process.env.PORT || 8080;
       var express = require("express");
       var app = express();
       const exphbs = require('express-handlebars');
       const bodyParser = require('body-parser');
       const clientSessions = require("client-sessions");
       const dataServiceComments = require("./data-service-comments.js");
       var dataService = require("./data-service.js");
       var dataServiceAuth = require("./data-service-auth");
       var path = require("path");
       app.use(express.static(__dirname + '/public/'));
       
       
       app.use(bodyParser.urlencoded({ extended: true }));

       //or app.use(bodyParser());
       
       app.use(clientSessions({
        cookieName: "session", // this is the object name that will be added to 'req'
        secret: "A7_web322", // this should be a long un-guessable string.
        duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
        activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
      }));

      app.use(function(req, res, next) {
        res.locals.session = req.session;
        next();
      });

       app.engine(".hbs", exphbs({
         extname: ".hbs",
         defaultLayout: 'layout',
         helpers: {
           equal: function (lvalue, rvalue, options) {
             if (arguments.length < 3)
               throw new Error("Handlebars Helper equal needs 2 parameters");
             if (lvalue != rvalue) {
               return options.inverse(this);
             } else {
               return options.fn(this);
             }
           }
         }
       }));
       app.set("view engine", ".hbs");
       
       function ensureLogin(req, res, next) {
        if (!req.session.user) {
          res.redirect("/login");
        } else {
          next();
        }
      }

      const user = {
        username: ""
      };

       function onHttpStart() {
        console.log("Express http server listening on: " + HTTP_PORT);
      }
       
       app.get("/", function(request,response){  
          response.render("home");
       });
       
       app.get("/about", function(request,response){
          dataServiceComments.getAllComments().then((dataFromPromise) =>{
          response.render("about", {data: dataFromPromise});
        })
        .catch(() => {
          response.render("about");
        });
      });
       
       app.get("/employees",ensureLogin, function(request,response){
         if(request.query.status){
       dataService.getEmployeesByStatus(request.query.status).then(function(data) {
         response.render("employeeList", { data: data, title: "Employees" });
       }).catch((err) => {
         response.render("employeeList", { data: {}, title: "Employees" });
       });
       
       /////////////////////////////////////////////
         }
         
             else if(request.query.department){
               dataService.getEmployeesByDepartment(request.query.department).then((data) => {
                 response.render("employeeList", { data: data, title: "Employees" });
             }).catch((err) => {
                 response.render("employeeList", { data: {}, title: "Employees" });
             });
             }
             /////////////////////
             else if(request.query.manager){
               dataService.getEmployeesByManager(request.query.manager).then((data) => {
                 response.render("employeeList", { data: data, title: "Employees" });
             }).catch((err) => {
                 response.render("employeeList", { data: {}, title: "Employees" });
             });
             }else{
               dataService.getAllEmployees().then((data) => {
                 response.render("employeeList", { data: data, title: "Employees" });
             }).catch((err) => {
                 response.render("employeeList", { data: {}, title: "Employees" });
             });
             }
         });
       
       app.get("/employee/:empNum",ensureLogin, function(request,response){
        // initialize an empty object to store the values
            let viewData = {};
            dataService.getEmployeeByNum(request.params.empNum)
              .then(function(data) {
                  viewData.data = data; //store employee data in the "viewData" object as "data"
              }).catch(function(){
                  viewData.data = null; // set employee to null if there was an error 
              }).then(dataService.getDepartments)
              .then(function(data) {
                  viewData.departments = data; // store department data in the "viewData" object as "departments"
                // loop through viewData.departments and once we have found the departmentId that matches
                // the employee's "department" value, add a "selected" property to the matching 
                // viewData.departments object
                for (let i = 0; i < viewData.departments.length; i++) {
                    if (viewData.departments[i].departmentId == viewData.data.department) {
                        viewData.departments[i].selected = true;
                    }
                }
            }).catch(function(){
                viewData.departments=[]; // set departments to empty if there was an error
            }).then(function(){
            if(viewData.data == null){ // if no employee - return an error
              response.status(404).send("Employee Not Found");
            }else{
              response.render("employee", { viewData: viewData }); // render the "employee" view
            }
          });
       });
       
       
       app.post("/employee/update",ensureLogin, (req, res) => {
         dataService.updateEmployee(req.body).then((data) => {
             console.log("data::");
             console.log(req.body);
             res.redirect("/employees");
         }).catch((err) => {
             console.log(err);
         })
       });
       
       app.get("/managers",ensureLogin, function(request,response){
             dataService.getManagers().then(function(data){
               response.render("employeeList", { data: data, title: "Employees (Managers)" });
             }).catch(function(err){
               res.render("employeeList", { data: {}, title: "Employees (Managers)" });
             });
       });
       
       app.get("/departments",ensureLogin, function(request,response){
             dataService.getDepartments().then(function(data){
               response.render("departmentList", { data: data, title: "Departments" });
             }).catch(function(err){
               response.render("departmentList", { data: data, title: "Departments" });
             });
       });
       
       app.get("/employees/add",ensureLogin, (req,res) => {
            dataService.getDepartments().then(function(data) {
                res.render("addEmployee", {departments: data});
            }).catch(function(err) {
                // set department list to empty array
               res.render("addEmployee", {departments: [] });
            });
        });
       
        app.post("/employees/add",ensureLogin, (req, res) => {
          dataService.addEmployee(req.body).then(function() {
            res.redirect("/employees");
          });
       });
       
       app.get("/departments/add",ensureLogin, function(req,res) {
        res.render("addDepartment");
      });

      app.get("/department/:departmentId",ensureLogin, function(req, res) {
        dataService.getDepartmentById(req.params.departmentId).then(function(data) {
          res.render("department", { data: data });
        }).catch(function(err) {
          res.status(404).send("Department Not Found");
        });
      });

      app.post("/departments/add",ensureLogin, function(req, res) {
        dataService.addDepartment(req.body).then(function() {
          res.redirect("/departments");
        });
      });
      
      app.get("/employee/delete/:empNum",ensureLogin, function(req,res) {
        dataService.deleteEmployeeByNum(req.params.empNum).then(function() {
          res.redirect("/employees");
        }).catch(function(err) {
          res.status(500).send("Unable to Remove Employee / Employee Not Found");
        });
      });
      
      app.post("/employee/update", function(req, res) {
          dataService.updateEmployee(req.body).then(function() {
          res.redirect("/employees");
        });
      });
      
      app.post("/department/update",ensureLogin, function(req, res) {
          dataService.updateDepartment(req.body).then(function() {
          res.redirect("/departments");
        });
      });      

      app.post("/about/addComment", (req, res) => { 
        console.log("Comment Added");
          dataServiceComments.addComment(req.body).then(()=>{
            //console.log("Rendered about.hbs");
          res.redirect("/about"); 
         })
         .catch((err) =>{
           console.log(err);
           res.redirect("/about");
         })
     });

     app.post("/about/addReply", (req, res) => { 
      dataServiceComments.addReply(req.body).then( () => {
      res.redirect("/about"); 
     })
     .catch((err) =>{
       console.log(err);
       res.redirect("/about");
      })
    });
 
    app.get("/login", (req, res) => {
      res.render("login");
    });

    app.get("/register", (req, res) => {
      res.render("register");
    });

       app.post("/register", (req, res) => {
        dataServiceAuth.registerUser(req.body).then(() => {
            res.render("register", {successMessage: "User created"});
        }).catch((err) => {
            res.render("register", {errorMessage: err, user: req.body.user});
        });
      });

      app.post("/login", (req, res) => {
        dataServiceAuth.checkUser(req.body).then(() => {
            const username = req.body.user;
            
            req.session.user = {
                username: username
            };
            console.log(JSON.stringify(req.session));
            res.redirect("/employees");
        }).catch((err) => {
            
            res.render("login", {errorMessage: err, user: req.body.user});
        });
      });

      app.get("/logout", (req, res) => {
        req.session.reset();
        res.redirect('/');
      });

      app.use((req, res) => {
        res.status(404).send("Page Not Found");
      });

       dataService.initialize()
       .then(()=>{
         //console.log("Working initialize!!");
         dataServiceComments.initialize();
       }).then(()=>{
         console.log("Working uptill here!!\n\n");
        dataServiceAuth.initialize();
       })
       .then(()=>{
         app.listen(HTTP_PORT, onHttpStart);
       })
       .catch((err)=> {
         console.log("Unable to initialize the dataService module: " + err);
       });
     

       // It was a testing code provided by my Professor. 

       /*app.listen(HTTP_PORT, function(response,request){
              console.log("Express HTTP server listening on: " + HTTP_PORT);
              dataService.initialize().then(function(data){
                  console.log(data)
                }).catch(function(err){
                  console.log(err);
                });
            });*/
//Testing Code
   /*         dataServiceComments.initialize()
            .then(() => {
              dataServiceComments.addComment({
                authorName: "Comment 1 Author",
                authorEmail: "comment1@mail.com",
                subject: "Comment 1",
                commentText: "Comment Text 1"
              }).then((id) => {
                dataServiceComments.addReply({
                  comment_id: id,
                  authorName: "Reply 1 Author",
                  authorEmail: "reply1@mail.com",
                  commentText: "Reply Text 1"
                }).then(dataServiceComments.getAllComments)
                .then((data) => {
                  console.log("comment: " + data[data.length - 1]);
                  process.exit();
                });
              });
            }).catch((err) => {
              console.log("Error: " + err);
              process.exit();
            });*/
          
       