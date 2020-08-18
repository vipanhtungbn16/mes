const sequelize = require('../Config/db')
const { Sequelize, DataTypes } = require('sequelize');
const Friend =sequelize.define('Friend',{
  id:{type: DataTypes.BIGINT,
  primaryKey: true,
  autoIncrement: true,
},
  name:{
    type:DataTypes.STRING,
    allowNull:false
  },
 email:{
   type:DataTypes.TEXT,
   allowNull:false
 },
 UserId:{
   type:DataTypes.BIGINT,
   allowNull:false
 }
  
},{
  timestamps: false,
}) 
module.exports = Friend