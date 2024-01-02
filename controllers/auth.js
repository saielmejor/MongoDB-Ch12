//authentication contorller

exports.getLogin = (req, res, next) => {
  //  const isLoggedIn=req.get("Cookie").split(';')[0].trim().split('=')[1]==='true'
  console.log(req.session.isLoggedIn)
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
  req.session.isLoggedIn = true; //sets a session
  res.redirect("/");
};
