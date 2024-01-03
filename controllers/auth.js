const User=require('../models/user')

//authentication contorller

exports.getLogin = (req, res, next) => {
  //  const isLoggedIn=req.get("Cookie").split(';')[0].trim().split('=')[1]==='true'
  // console.log(req.session.isLoggedIn)
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  //ensure that the user is logged in
  //   //set a cookie
  //   res.setHeader("Set-Cookie", "loggedIn=true ; HttpOnly");
  
 
  //middleware to find user

  User.findById('658ca1cfa92ad0246833e461').then(user=>{
    req.session.isLoggedIn = true; //sets a session
    req.session.user= user //allows to the user in the request. user 
    res.redirect("/");
  }).catch(err=>{
    console.log(err)
  })
  // next() //call next otherwise other income request is dead
}


