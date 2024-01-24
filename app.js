const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");const multer=require('multer')
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf=require('csurf')// csrf token 
const flash=require('connect-flash')
const errorController = require("./controllers/error");




const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://saiken1:Welcome100@cluster0.5ufzjqa.mongodb.net/shopp?retryWrites=true&w=majority";
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
}); //cosntructor function

const csrfProtection=csrf()

const fileStorage=multer.diskStorage({ 
  destination: (req,file,cb)=>{
    cb(null,'images') // store in in the image folder 
  } , 
  filename: (req,file,cb)=>{ 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,  uniqueSuffix + '-' +file.originalname )
  }
})// storage engine

//filter  
const fileFilter=(req,file,cb)=>{ 
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){ 
    cb(null,true)
  }else{ 
    cb(null,false)
  }
}
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage:fileStorage, fileFilter:fileFilter}).single('image')) // middleware to accept images 
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: "false",
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection)
app.use(flash()) 
app.use((req,res,next)=>{ 
  res.locals.isAuthenticated=req.session.isLoggedIn; 
  res.locals.csrfToken=req.csrfToken() //calls csrfToken
  next()
})
app.use((req, res, next) => {
  // throw new error('Dummy Error ')
  if (!req.session.user) {
    return next(); // return next so the next code does not get executed
  }
  //find id middleware
  //finds the session user id

  User.findById(req.session.user._id)
    .then(user => {
      // throw new error('Dummy Error ')
      if (!user){ 
        return next() // return next if it doesnt find the user in the server 
      }
      //set user model for mongoose
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err)) // throw a error for finding the technical issue 
    });
});

// middleware for csrf token , this will be available in all views 


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
//get a route for 500 error page
app.get('/500', errorController.get500)
app.use(errorController.get404); 

//special type of middleware for handling error 
app.use((err,req,res,next)=>{ 
  res
  .status(500)
  .render("500", {
    pageTitle: "Error!, Please check with Administrator",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
})

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);

  })
  .catch((err) => {
    console.log(err);
  });
