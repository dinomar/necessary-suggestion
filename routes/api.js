/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) { throw err; }
        const dbo = db.db('freecodecamp');
        dbo.collection('library').find({}).toArray((err, data) => {
          if (err) { throw err; }
          res.json(data);
          db.close();
        });
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title){
        return res.end('no title');
      }
       MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
         if (err) { throw err; }
         const dbo = db.db('freecodecamp');
         const newBook = { title: title, commentcount: 0};
         dbo.collection('library').insertOne(newBook, (err, data) => {
           if (err) { throw err; }
           res.json(data.ops[0]);
           db.close();
         });
       });
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if(err) { throw err; }
        const dbo = db.db('freecodecamp');
        dbo.collection('library').deleteMany({}, (err, data) => {
          if (err) { throw err; }
          res.end('complete delete successful');
          db.close();
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) { throw err; }
        const dbo = db.db('freecodecamp');
        const query = { _id: ObjectId(bookid) };
        dbo.collection('library').findOne(query, (err, data) => {
          if (err) { throw err; }
          if(!data) {
            return res.end('no book exists');
          }
          
          if(data.hasOwnProperty('commentcount')) {
            delete data.commentcount;
          }
          res.json(data);
          db.close();
        })
      });
    
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) { throw err; }
        const dbo = db.db('freecodecamp');
        const query = { _id: ObjectId(bookid) };
        const newComment = { $push: { comments: comment }, $inc: { commentcount: 1 } };
        dbo.collection('library').findOneAndUpdate(query, newComment, (err, data) => {
          if (err) { throw err; }
          res.json(data.value);
          db.close();
        });
      });
    
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) { throw err; }
        const dbo = db.db('freecodecamp');
        const query = { _id: ObjectId(bookid) };
        dbo.collection('library').deleteOne(query, (err, data) => {
          if (err) { throw err; }
          if (data.deletedCount != 0) {
            res.end('delete successful');
          }
          db.close();
        });
      });
      //if successful response will be 'delete successful'
    });
  
};
