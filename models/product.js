// // const Sequelize = require("sequelize");

// // //import database connection

// // const sequelize = require("../util/database");

// const mongodb=require('mongodb')
// const getDb = require("../util/database").getDb;
// // create a new class with mongodb
// class Product {
//   constructor(title, price, description, imageUrl,id,userId) {
//     this.title = title;
//     this.price = price; 
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;//fith argument ,creates a new object  
//     this.userId=userId; 

//   }
//   //connect mongodb and save the product
//   save() { 
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       }); // returns a cursor which allows to connect us to the documents
//   }
//   // find one product
//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product=>{ 
//         console.log(product) 
//         return product 
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static deleteById(prodId){ 
//     const db=getDb() // get database 
//     return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) }).then(result=>{ 
//       console.log('Deleted')
//     }).catch(err=>{ 
//       console.log(err)
//     })
//   }
// }


//Mongoose 
const mongoose=require('mongoose') 
const Schema= mongoose.Schema; // creates new schema 

const productSchema=new Schema({ 
  //add simple key value pairs 
  title: { 
    type:String, 
    required:true 
  },
  price: { 
    type:Number, 
    required:true 
  }, 
  description: { 
    type:String, 
    required:true 
  }, 
  imageUrl: { 
    type:String, 
    required:true 
  }, 
  userId:{ 
    type: Schema.Types.ObjectId , 
    ref:'User', 
    required:true 
  }
})

//module exportss 

module.exports=mongoose.model('Product',productSchema) // creates a model to be shared  

// module.exports = Product;
