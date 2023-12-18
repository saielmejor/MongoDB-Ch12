
const Sequelize=require('sequelize'); 
const sequelize=require('../util/database') 

//holds the cart for different user 
const Cart=sequelize.define('cart',{ 
  id:{ 
    type:Sequelize.INTEGER, 
    autoIncrement: true, 
    allowNull:false,
    primaryKey:true 

  }
})

module.exports=Cart