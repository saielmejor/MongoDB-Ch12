const bcrypt = require("bcryptjs");
const nodemailer=require('nodemailer') 
const sendgridTransport=require('nodemailer-sendgrid-transport')
require('dotenv').config()
const User = require("../models/user");

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{ 
    api_key: process.env.SENDGRIDKEY, 
  }
}))

//authentication contorller

exports.getLogin = (req, res, next) => {
  //  const isLoggedIn=req.get("Cookie").split(';')[0].trim().split('=')[1]==='true'
  // console.log(req.session.isLoggedIn)

  let message=req.flash('error')
  if (message.length > 0){ 
    message=message[0]
  }else{ 
    message=null
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage:message // store an error message and it will remove when it is retrieve 
 
  });
};

exports.getSignup = (req, res, next) => {
  let message=req.flash('error')
  if (message.length > 0){ 
    message=message[0]
  }else{ 
    message=null
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage:message
    // isAuthenticated: false, it is retrieved in the req.locals in app js 
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        //store error message in the session 
        req.flash('error', ' Invalid email or password. ')
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash('error', 'Invalid password. ')
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', ' Email exist already, please pick another one')
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          
          res.redirect("/login");
          return transporter.sendMail({ 
            to:email, 
            from:'saikenhohung@gmail.com' , 
            subject: 'Signup succeeded' , 
            html:'<h1> You sucessfully signed up! </h1>'
          })
         
        }).catch(err=> { 
          console.log(err)
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//reset password 
exports.getReset=(req,res,next)=>{ 
  let message=req.flash('error')
  if (message.length > 0){ 
    message=message[0]
  }else{ 
    message=null
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage:message // store an error message and it will remove when it is retrieve 
 
  });
}