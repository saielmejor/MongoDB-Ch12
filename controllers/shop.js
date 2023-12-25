const Product = require("../models/product");
// const Cart = require("../models/cart");
// const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  //you can use findAll with restriction
  // Product.findAll({ where: { id: prodId } })
  //   .then((products) => {
  //     res.render("shop/product-detail", {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  Product.findById(prodId).then(product=>{ 
    res.render('shop/product-detail',{ 
      product:product, 
      pageTitle: product.title, 
      path: '/products'
    })
  }).catch(err=>{ 
    console.log(err)
  })
};

exports.getIndex = (req, res, next) => {
  //Sequelize findAll
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
.then((products) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      }
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product=>{ 
    return req.user.addToCart(product) 
  }
  ).then(result=>{ 
    console.log(result)
    res.redirect('/cart')
  }).catch(err=>{ 
    console.log(err)
  })
  
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
  
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include:['products']}) // you can only use include if you have association between roders and items 
    .then(orders=>{ 
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders:orders, //retrieves all orders 
      });
    })
    .catch((err) => {
      console.log(err);
    });
  
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity }; // get the quantity from the cart item  and adds it to the order array
              return product; //stores the array in product
            })
          );
        })
        .catch((err) => {
          console.log(err);
        }); //creates the order
      console.log(products);
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
      //removed the items from the cart by setting it to null
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
