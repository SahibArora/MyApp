// Name - Sahib Arora, Seneca UserName - sarora42, Seneca User Id - 1309391268.

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// creating the contentSchema..
var contentSchema = new Schema({
    "authorName":  String,
    "authorEmail": String,
    "subject": String,
    "commentText": String,
    "postedDate": Date,
    "replies": [{
      "comment_id": String,
      "authorName": String,
      "authorEmail": String,
      "commentText": String,
      "repliedDate": Date
    }]
});

let Comment; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

        console.log("Initailize in Data comments!!!");
// Setting up the connection here...
    let db = mongoose.createConnection("mongodb://sarora42:Matrixsaloon36$@ds163796.mlab.com:63796/web322_a6_sarora42");
    db.on('error', (err)=>{
        reject(err); // reject the promise with the provided error
    });
    console.log("Initailize working in data server comments!!!");
    db.once('open', ()=>{
        Comment = db.model("comments", contentSchema);
        resolve();
        });
    });
};

// addComment function.

module.exports.addComment = function (data) {
    return new Promise(function (resolve, reject) {
        data.postedDate = Date.now();
        
        let newComment = new Comment(data);
        
        newComment.save((err) => {
        if(err) {
                reject("There was an error saving the comment: " + err);
        } else {
            resolve(newComment._id);
        }
        });
    });
};

// this function will get all the comments down the about page.

module.exports.getAllComments = function () {
    return new Promise(function (resolve, reject) {
        Comment.find({})
        .sort({postedDate : 1})
        .exec()
        .then(function(data){
            resolve(data);
        })
        .catch(function(err){
            reject(err);
        })
   });
};

// Add Reply function...

module.exports.addReply = function (data) {
    return new Promise(function (resolve, reject) {
       data.repliedDate = Date.now();   
        Comment.update(                         // updating according to the provided ID.
               { _id : data.comment_id},
               { $addToSet: { replies : data } },
               { multi: false })   
        .exec()
        .then(function(){
            resolve();
        })
        .catch(function(err){
            reject(err);
        })
   });
};