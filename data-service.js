// Name - Sahib Arora, UserName - sarora42, userID - 130939168

/*var fs = require("fs");
var employees = [];
var departments = [];*/

// Connecting it with postgress..

const Sequelize = require('sequelize');
var sequelize = new Sequelize('dchtbkghv8mq3f', 'loilaihcpwsdho', 'c74f0952a728f9ecfe59aa3a24044e4c9708105316fc7cf3c0e80be2dae50264', {
    host: 'ec2-54-243-185-123.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

// Defining a "Project" model
var Project = sequelize.define('Project', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT
});

// syncing it with the postgres database
sequelize.sync().then(function () {
    Project.create({
        title: 'Project_1',
        description: 'First'
    }).then(function (project) {
        console.log("success!")
    }).catch(function (error) {
        console.log("something went wrong!");
    });
});

// Creating an empoyee model (table)
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

// Defining a "Department" model
var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

/*module.exports.initialize = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(Employee) {
            resolve();
        }).then(function(Department) {
            resolve("SYNCING");
        }).catch(function(err) {
            reject("unable to synchronize the database");
        });
        reject();
    });
}*/

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then( () => {
            resolve();
        }).catch(()=>{
            reject("unable to sync the database");
        });
    });
  };

//console.log(initialize());
module.exports.getAllEmployees = function(){
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll());
        }).catch(function(err) {
            reject("no results returned.");
        });
    });
}
    
   
// function to get employee by its status
module.exports.getEmployeesByStatus = function(status){
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where:{
                    status: status
                }}));
        }).catch(function(err) {
            reject("no results returned.");
        });
    });
}
    
// function to get employees through departments.
module.exports.getEmployeesByDepartment = function(department){
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where:{
                    department: department
            }}));
        }).catch(function(err) {
            reject("no results returned.");
        });
    });
}
    
// function to find all the managers.
module.exports.getEmployeesByManager = function(manager) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where:{
                    employeeManagerNum: manager
                }
            }));
            }).catch(function(err) {
                reject("no results returned.");
        });
    });
}
    
// function to find the employee by emp ID
module.exports.getEmployeeByNum = function(num) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where:{
                    employeeNum: num
                }
            }));
            }).catch(function(err) {
                reject("no results returned.");
        });
    });
}

// function which helps to delete an employee through employee ID
module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            resolve(Employee.destroy({
                where:{
                    employeeNum:empNum  
                }
            }));
        }).catch(function(err){
            reject("Unable to Delete Employee");
        });
    });
}
    
// function to get department trough id
module.exports.getDepartmentById = function (id) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Department.findAll({
                where:{
                    departmentId: id
                }}));
        }).catch(function(err) {
            reject("unable to find department");
        });
    });
};

// function to find the particular department.
module.exports.getManagers = function() {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where:{
                    isManager: true
                }})
            );
        }).catch(function(err) {
            reject("no results returned.")
        });
    });
}
    
// function which helps to find the departments.
module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Department.findAll());
        }).catch(function(err) {
            reject("no results returned.");
        });
    });
}

// function to add an employee.
module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            for (let x in employeeData) {
                if(employeeData[x] == ""){
                    employeeData[x] = null;
                }
            }
            resolve(Employee.create({
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                isManager: employeeData.isManager,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate}));
            }).catch(function() {
                reject("unable to create employee.");
            });
        }).catch(function() {
            reject("unable to create employee.");
    });
}

// function for updating the employee.
module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            for (let x in employeeData) {
                if(employeeData[x] == ""){
                    employeeData[x] = null;
                }
            }
            resolve(Employee.update({
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressPostal: employeeData.addressPostal,
                addressState: employeeData.addressPostal,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department
            }, { where: {
                employeeNum: employeeData.employeeNum
            }}));
        }).catch(function() {
            reject("unable to create employee.");
        });
    });
}

// function for adding the department.
module.exports.addDepartment = function (departmentData) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            for(let x in departmentData){
                if(departmentData[x] == "") {
                    departmentData[x] = null;
                }
            }
            Department.create({
                departmentId: departmentData.departmentId,
                departmentName: departmentData.departmentName
            }).then(function() {
                resolve(Department);
            }).catch(function(err) {
                reject("unable to create department.");
            });
        }).catch(function() {
            reject("unable to create department.");
        });
    });
}

// function which will update department
module.exports.updateDepartment = function(departmentData) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function() {
            for(let x in departmentData){
                if(departmentData[x] == "") {
                    departmentData[x] = null;
                }
            }
            Department.update({
                departmentName: departmentData.departmentName
            }, { where: {
                departmentId: departmentData.departmentId
            }}).then(function() {
                resolve(Department);
            }).catch(function(err) {
                reject("unable to create department.");
            });
        }).catch(function() {
            reject("unable to create department.");
        });
    });
};