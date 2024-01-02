const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session=require('express-session') 
const MongoDBStore=require('connect-mongodb-session')(session)
const errorController = require("./controllers/error");

const mongoConnect = require("./util/database").mongoConnect;

const User = require("./models/user");

const app = express();
const store=new MongoDBStore({})

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, "public"))); 

app.use(session({secret:'my secret',resave:'false',saveUninitialized:false}))
//middleware to find user
app.use((req, res, next) => {
  User.findById('658ca1cfa92ad0246833e461').then(user=>{
    req.user= user //allows to the user in the request. user 
    next()
  }).catch(err=>{
    console.log(err)
  })
  // next() //call next otherwise other income request is dead
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// mongoConnect(()=>{
//   //add if the user id exist

//   app.listen(3000)
// })

mongoose
  .connect(
    "mongodb+srv://saiken1:Welcome100@cluster0.5ufzjqa.mongodb.net/shopp?retryWrites=true&w=majority"
  )
  .then((result) => { 
    User.findOne().then(user=>{ 
      if( !user){ 
        const user= new User({ 
          name:'Saiken', 
          email:'Saikenh@gmail.com', 
          cart:{ 
            items:[]
          }
        }) 
        user.save()
      }
    })
    
    app.listen(3000);
    console.log("Connected");
  })
  .catch((err) => {
    console.log(err);
  });
