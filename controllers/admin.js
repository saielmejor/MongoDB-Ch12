const Product = require("../models/product");
const mongoose=require('mongoose')
const { validationResult}=require('express-validator')
//request the object id

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError:false,
    isAuthenticated:req.session.isLoggedIn, 
    errorMessage:null,
    validationErrors:[]
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors=validationResult(req)
  //left side are the keys from the models and the right side is the req body

  if(!errors.isEmpty()){ 
   return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError:true,
      product: { 
        title:title, 
        imageUrl:imageUrl, 
        price: price, 
        description: description


      },
      errorMessage:errors.array()[0].msg,
      validationErrors:errors.array()
    });
  }
  const product = new Product({
    // _id: new mongoose.Types.ObjectId('65ae882fdd1deb8c2d027438'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user, // access to the user id from request
  }); // save it as a constructor include the user id
  product
    .save()
    .then((result) => {
      console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {

      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError:true,
      //   product: { 
      //     title:title, 
      //     imageUrl:imageUrl, 
      //     price: price, 
      //     description: description
  
  
      //   },
      //   errorMessage:'Data operation failed, please try again ',
      //   validationErrors:[]
      // });
      // console.log('An error occurred ')
      // console.log(err);
      // res.redirect('/500')

      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error); // return next error 

    });
};

exports.getProducts = (req, res, next) => {
  //restrict the data we can see in the admin products. Only users who created the product can view and edit 
  Product.find({userId:req.user._id})
    // .select("title price -_id")
    // .populate("userId", "name") // populates the user id 
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated:req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError:false, 
        errorMessage:null, 
        validationErrors:[]
       
      });
    })
    .catch((err) => {
       const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updateTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors=validationResult(req)
  //left side are the keys from the models and the right side is the req body

  if(!errors.isEmpty()){ 
   return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError:true,
      product: { 
        title:updateTitle, 
        imageUrl:updatedImageUrl, 
        price: updatedPrice, 
        description: updatedDesc,
        _id:prodId // you need to cast the id so it is passed to the product 


      },
      errorMessage:errors.array()[0].msg, 
      validationErrors:errors.array()
    });
  }
  Product.findById(prodId) 
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()){ 
        return res.redirect('/')// redirect to the home screen
      }
      product.title = updateTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT");
        res.redirect("/admin/products");
      });
    })
    
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id:prodId,userId:req.user._id})
    .then(() => {
      console.log("Destroyed product");
      res.redirect("/admin/products ");
    })
    .catch((err) => {
      const error=new Error(err)
      error.httpStatusCode=500 
      return next(error)
    });
};
