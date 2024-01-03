const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session=require('express-session') 
const MongoDBStore=require('connect-mongodb-session')(session)
const errorController = require("./controllers/error");

const mongoConnect = require("./util/database").mongoConnect;

const User = require("./models/user");
const MONGODB_URI=   "mongodb+srv://saiken1:Welcome100@cluster0.5ufzjqa.mongodb.net/shopp?retryWrites=true&w=majority"
const app = express();
const store=new MongoDBStore({
  uri:MONGODB_URI,
  collection: 'sessions',
}) //cosntructor function

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, "public"))); 

app.use(session({secret:'my secret',resave:'false',saveUninitialized:false, store:store}))

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose
  .connect(
   MONGODB_URI
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
