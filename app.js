const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const mongoConnect=require('./util/database').mongoConnect

const User=require('./models/user') 



const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
  User.findById('65884a7fbd698cc4d49491e5').then(user=>{
    req.user= new User(user.name,user.email,user.cart,user._id); //allows to work with database and modify the database  
    next()
  }).catch(err=>{ 
    console.log(err)
  })
  // next() //call next otherwise other income request is dead  
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoConnect(()=>{ 
  //add if the user id exist 

  app.listen(3000)
})

