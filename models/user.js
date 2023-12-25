const mongodb = require("mongodb");
const { getCart } = require("../controllers/shop");
const getDb = require("../util/database").getDb;

const ObjectId = mongodb.ObjectId;
class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; //{itms:[]}
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  //add product to cart
  addToCart(product) {
    // check if cart contains the product

    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // finds the product if it exist in the cart
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]; // gets all the cart items and inserts it into an array

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity + 1,
      });
    }
    //

    const updatedCart = { items: updatedCartItems }; // update product with 1 quantity and stores the product ID
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: updatedCart } } // override the existing product in the cart with new product with quantity 1
    );
  }
  getCart() {
    //return the cart items
    const db = getDb(); // gives access to the cart
    const productIds = this.cart.items.map((i) => {
      return i.productId; // maps and creates an arrray of product ID
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      });
  }
  deleteItemFromCart(productId){ 
    const updatedCartItems=this.cart.items.filter(item=>{ 
        return item.productId.toString() !== productId.toString();  //return false
    })
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: {items:updatedCartItems} } } // override the existing product in the cart with new product with quantity 1
    );
  
}
  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
