const path = require("path");

const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// // /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title","title has to be valid").isAlphanumeric().isLength({ min: 3 }).trim(),
    body("imageUrl","Please type a valid url ").isURL(),
    body("price","Please write a number ").isFloat(),
    body("description","Please type a description ").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title","title has to be valid").isString().isLength({ min: 3 }).trim(),
    body("imageUrl","Please type a valid url ").isURL(),
    body("price","Please write a number ").isFloat(),
    body("description","Please type a description ").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
