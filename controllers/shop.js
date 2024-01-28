const fs = require("fs"); // allows us to read file
const path = require("path");
const Product = require("../models/product");
// const Cart = require("../models/cart");
const Order = require("../models/orders");
const orders = require("../models/orders");

const PDFDocument = require("pdfkit");

const ITEMS_PER_PAGE = 1;
exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // findbyid is defined by mongoose
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  //retrieves page  number
  const page = +req.query.page ||1;

  //Sequelize findAll

  // use product find and count the number of products
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page < 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  // finds the user using the orders collection
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        //retrieves all orders
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  //obtains cart items
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          userId: req.user,
        },
        products: products,
      });
      order.save(); // saves the orde
      //initialize the order model
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  //check if the order is added by the user
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found. "));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized "));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument(); // pdf document (readable stream)

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res); // //forward to to the writeable stream

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("------------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice = totalPrice + prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              "-" +
              prod.quantity +
              "x" +
              "$" +
              prod.product.price
          );
      });

      pdfDoc.text("------------");
      pdfDoc.fontSize(20).text("Total PriceL $" + totalPrice);

      pdfDoc.end(); // this is a note to close the writeable text
      //for bigger file it will take long to read the file .
      //   fs.readFile(invoicePath,(err,data)=>{
      //     if(err){
      //       return next(err);
      //     }
      //     res.setHeader('Content-Type','application/pdf')
      //     res.setHeader('Content-Disposition','inline; filename="'+invoiceName+ '"') // open the file inline
      // res.send(data) // sends the file
      //   })

      //streaming the data

      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res) // pipe method to
    })
    .catch((err) => {
      console.log(err);
    });
};
