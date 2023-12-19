// const Sequelize = require("sequelize");

// //import database connection

// const sequelize = require("../util/database");

const getDb = require("../util/database").getDb;
// create a new class with mongodb
class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }
  //connect mongodb and save the product
  save() {
    const db = getDb(); //connects to database
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db=getDb()
    return db.collection("products").find().toArray().then(products=>{ 
      console.log(products) ; 
      return products
    }).catch(err=>{ 
      console.log(err)
    }); // returns a cursor which allows to connect us to the documents
  }
}

module.exports = Product;
