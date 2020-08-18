const sequelize = require('../Config/db')
const { Sequelize, DataTypes } = require('sequelize');
const Chat =sequelize.define('Chat',{
  id:{type: DataTypes.BIGINT,
  primaryKey: true,
  autoIncrement: true,
},
 text:{
   type:DataTypes.TEXT,
   allowNull:false
 }
  
},{
  timestamps: true,
}) 
module.exports = Chat