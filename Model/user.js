const sequelize = require('../Config/db')
const { Sequelize, DataTypes } = require('sequelize');
const Users =sequelize.define('Users',{
  id:{type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name:{
    type:DataTypes.STRING,
    allowNull:false
  },
  email:{
    type:DataTypes.STRING,
    allowNull:false,
    unique: true
  },
  password:{
    type:DataTypes.STRING,
    allowNull:false
  },
  
},{
  timestamps: false,
}) 
module.exports = Users