// const Sequelize = require("sequelize");

// //import database connection

// const sequelize = require("../util/database");

const mongodb=require('mongodb')
const getDb = require("../util/database").getDb;
// create a new class with mongodb
class Product {
  constructor(title, price, description, imageUrl,id) {
    this.title = title;
    this.price = price; 
    this.description = description;
    this.imageUrl = imageUrl;
    this._id=id //fith argument 
  }
  //connect mongodb and save the product
  save() { 
    const db = getDb(); //connects to database
    
    // let db operation 
    let dbOp; 
    if (this._id){ 
      //Update the product\
      dbOp=db.collection("products").updateOne({_id: new mongodb.ObjectId(this._id)},{$set:this})
    }else{ 
      dbOp=db.collection("products").insertOne(this)
    }

    return dbOp.then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => {
        console.log(err);
      }); // returns a cursor which allows to connect us to the documents
  }
  // find one product
  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product=>{ 
        console.log(product) 
        return product 
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;
