
//connect to Mongodb 
const mongodb = require('mongodb') 
const MongoClient=mongodb.MongoClient; 


let _db; 
const mongoConnect=(callback)=>{ 

  MongoClient.connect('mongodb+srv://saiken1:Welcome100@cluster0.5ufzjqa.mongodb.net/shop?retryWrites=true&w=majority').then(client=>{  
    console.log('Connected ! ')
    _deb=client.db()// connect to database  store in _db 
    callback()
  }).catch(err=>{ 
    console.log(err)
    throw err 
  }); //create a connection to mongodb 
  
};

const getDb=()=>{ 
  if(_db){
    return _db
  }
  throw 'No database found! '
}

exports.mongoConnect=mongoConnect
exports.getDb=getDb
