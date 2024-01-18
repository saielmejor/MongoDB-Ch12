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
router.post("/login", authController.postLogin);
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
            return Promise.reject(
              "Email exist already, please pick a different one"
            );
          }
        });
      }),
    // checks the password and takes it from the body
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(), // restriction for password
    // chexk for password and field equality in the application by using custom validatior
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
