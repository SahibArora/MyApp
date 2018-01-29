const mongoose = require('mongoose');

let Schema = mongoose.Schema;

// Creating a schema for the Users, ("User" as their userName and "password" as their passwords) 

let userSchema = new Schema({
  user:  {                    //userNAme 
    type: String,
    unique: true
  },
  password: String           // password
});

let User; // to be defined on new connection (see initialize)

// Creating connection with mongoDB.

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

        let db = mongoose.createConnection("mongodb://sarora42:Matrixsaloon36$@ds163796.mlab.com:63796/web322_a6_sarora42");
        
        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });

    });
};

module.exports.registerUser = function(userData){
     return new Promise(function (resolve, reject) {

        // Passwords of two users shouldn't match.

         if(userData.password != userData.password2){
             reject("Passwords do not match");
         }else{
        // It will check if the userName is already taken or not or any other issues while taking that userName
            let newUser = new User(userData);
            newUser.save((err) => {
                if (err) {
                    if(err.code == 11000){
                        reject("User Name already taken");
                    }else{
                        reject("There was an error creating the user: " + err);
                    }
                    
                } else {
                    resolve();
                }
            });
         }

     });
};

// this function will authenticate the user.

module.exports.checkUser = function(userData){
    return new Promise(function (resolve, reject) {

        User.find({ user: userData.user})
            .exec()
            .then((users) => {
                if(users.length == 0){
                    reject("Unable to find user: " + userData.user);
                }else{
                    if(users[0].password == userData.password){
                        resolve();
                    }else{
                        reject("Incorrect Password for user: " + userData.user);
                    }
                }
            }).catch((err) => {
                reject("Unable to find user: " + userData.user);
            });

     });
};