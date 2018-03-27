var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');

//Both are for bcrypt
const saltRounds = 10;
var holdHash;

//To hold mongodb database object
var dbo;
var he;

//To hold all form formItems
var formItems;

//To display different messages
var errorMessage;

//To display message for new signup or login

function connectDB() {

  var url = "mongodb://localhost:27017/";
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database connected!");
    dbo = db.db("users");

  });
}

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.render('users', {
    errorMsg: ""
  });
  connectDB();

});


router.post('/signin', function(req, res, next) {
  formItems = req.body;
  console.log(formItems);
  //if form is empty
  if (!formItems.username || !formItems.password || !formItems.name || !formItems.address) {
    errorMessage = "Form Items cannot be empty!";
    res.render('users', {
      errorMsg: errorMessage
    });
  }else if(formItems.password != formItems.repassword){
    errorMessage = "Passwords do not match!!";
    res.render('users', {
      errorMsg: errorMessage
    });
  }else {
    var query = {
      username: formItems.username
    };
    dbo.collection("user").find(query, {
      _id: 0,
      username: 1
    }).toArray(function(err, result) {
      if (err) throw err;
      console.log(result.length);
      // if user does not exists
      if (!result.length) {

        bcrypt.hash(formItems.password, saltRounds, function(err, hash) {
          //insert password
          if (err) {
            console.log("cannot bcrypt the password");
            res.redirect('erroruser');
          } else {
            query = formItems;
            delete query.repassword;
            query.password = hash;
            console.log(query);


            dbo.collection("user").insertOne(query, function(err, result) {
              if (err) throw err;
              console.log("1 document inserted");
              message = formItems.name + ", Your account has been created";
              res.render('login', {msg: message});
              console.log("account crated");
            });

          }

        });



      } else {
        //if user exists
        console.log("user already exists")
        errorMessage = "User " + formItems.username + " already exists";
        res.render('erroruser', {
          errorMsg: errorMessage
        });
      }
    });


  }


});


router.post('/login', function(req, res, next) {

  formItems = req.body;

  if(!formItems.username || !formItems.password){
    errorMessage = "Form Items cannot be empty!";
    res.render('users', {
      errorMsg: errorMessage
    });
  }else{
    query = {username:formItems.username};
    dbo.collection('user').find(query,{_id:0, username:1}).toArray(function(err,result){
      if (err) throw err;
      if(!result.length){
        errorMessage = "User " + formItems.username + " not found! Please signin";
        res.render('users',{errorMsg:errorMessage});
      }else{

        console.log(result);
          //check the Password
          bcrypt.compare(formItems.password,result[0].password,function(error, passwordMatch){
            if(error) throw error;
            if(passwordMatch){
              message = " back, " + result[0].name;
              res.render('login', {msg: message});
            }else{
              errorMessage = "Password do not match!. Please try Again";
              res.render('users',{errorMsg:errorMessage});
            }
          });

      }
    });
  }
});
module.exports = router;
