const path = require("path");
const User = require("../models/user");
const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword); // gets a token dynamically
router.post("/reset", authController.postReset);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            //create a reject promise and stores a
            return Promise.reject(
              "Email does not exist, please select the correct user"
            );
          }
        });
      }),
    body(
      "password",
      "Password have to be valid"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
      
      // body("password").custom((value, { req }) => {
      //   if (value !== req.body.password) {
      //     throw new Error("incorrect password");
      //   }
      //   return true;
      // }),// restriction for password
  ],
  authController.postLogin
);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        // if (value === "test@gmail.com") {
        //   throw new Error("This email is forbidden");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            //create a reject promise and stores a
            return Promise.reject(
              "Email exist already, please pick a different one"
            );
          }
        });
      }).normalizeEmail(),
    // checks the password and takes it from the body
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(), // restriction for password
    // chexk for password and field equality in the application by using custom validatior
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
