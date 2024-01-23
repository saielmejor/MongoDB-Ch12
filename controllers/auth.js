const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
require("dotenv").config();
const { validationResult } = require("express-validator");
const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRIDKEY,
    },
  })
);

//authentication contorller

exports.getLogin = (req, res, next) => {
  //  const isLoggedIn=req.get("Cookie").split(';')[0].trim().split('=')[1]==='true'
  // console.log(req.session.isLoggedIn)

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message, // store an error message and it will remove when it is retrieve
    oldInput: { 
      email: '' , 
      password: ''

    },
    validationErrors:[]
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    // isAuthenticated: false, it is retrieved in the req.locals in app js
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg, // select the email
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.", // select the email
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [{ path: "email", path: "password" }],
        });
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
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password.", // select the email
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [{ path: "email", path: "password" }],
          });
        })
        .catch((err) => {
          const error=new Error(err)
          error.httpStatusCode=500 
          return next(error)
        });
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req); // verify all the requests
  if (!errors.isEmpty()) {
    
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg, // select the email
      //send old input
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
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
        to: email,
        from: "saikenhohung@gmail.com",
        subject: "Signup succeeded",
        html: "<h1> You sucessfully signed up! </h1>",
      });
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//reset password
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message, // store an error message and it will remove when it is retrieve
  });
};
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex"); // hex decimal value conversion
    //find the user in the database
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.redirect("/reset");
        }
        //set the token and expiration
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "saikenhohung@gmail.com",
          subject: "Password reset",
          html: `
            <p> You requested to reset the password </p> 
            <p> Click this <a href="http://localhost:3000/reset/${token}"> link </a> to set a new password </p>`,
        });
      })
      .catch((err) => {
        const error=new Error(err)
        error.httpStatusCode=500 
        return next(error)
      });
  });
};
//gets thew password
exports.getNewPassword = (req, res, next) => {
  //check whether we have a token in the url
  const token = req.params.token;
  console.log(token);
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message, // store an error message and it will remove when it is retrieve
        userId: user._id.toString(), // renders the ID
        passwordToken: token, // gets the token in the view
      });
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  console.log(userId);
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};
