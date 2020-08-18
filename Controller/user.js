const JWT = require("jsonwebtoken");
const { json } = require('body-parser');
const mongoose = require('mongoose')
const User = require('../Model/user');
const Friend = require('../Model/friend');
const Chat = require('../Model/chat');
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const sequelize = require("../Config/db");

User.hasMany(Friend,{
  foreignKey: 'UserId'
});
Friend.belongsTo(User);

User.hasMany(Chat,{
  foreignKey:'UserChat'
})
Chat.belongsTo(User);


 //!JSON WEB TOKEN
let tokenList = {};
const encodeToken = (userID) =>{
  return JWT.sign({
    iss:"TT",
    sub:userID,
    iat:new Date().getTime(),
    exp:new Date().setDate(new Date().getDate() + 1),
  },'thanhtung')
}
const encodeTokenfresh = (userID) =>{
  return JWT.sign({
    iss:"TT",
    sub:userID,
    iat:new Date().getTime(),
    exp:new Date().setDate(new Date().getDate() + 10),
  },'thanhtung')
}
const verifyToken =(token,secretKey)=>{
  return new Promise((resolve, reject) => {
    JWT.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}
const refreshtoken = async (req,res)=>{

  // User gửi mã refresh token kèm theo trong body
  const refreshTokenFromClient = req.body.refreshToken;
  if (refreshTokenFromClient && (tokenList[refreshTokenFromClient])) {
    try {
      const decoded = await verifyToken(refreshTokenFromClient,'thanhtung')
      console.log(decoded)
    const userData = decoded.sub;
    console.log("userdata" + userData)

    const accessToken = encodeToken(userData._id)
    return res.status(200).json({accessToken});
    } catch (error) {
      res.status(403).json({
        message: 'Invalid refresh token.',
      });
    }
    

  }
  else{
     // Không tìm thấy token trong request
     return res.status(403).send({
      message: 'No token provided.',
    });
  }
}
//!END JWT
const newUser = async function(req,res,next){
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const foundUser =  await User.findOne({where:{email:email}})
    if(foundUser !== null) return res.json({messenger:"Tài khoản đã tồn tại "})
  try {
    
    const newUser = await User.create({name:name,email:email,password:password})
    

    return res.status(201).json({newUser})
  } catch (error) {
    next(error)
  }

}
const GetAllUser = async (req,res,next) =>{
 await  User.findAll({
   include:{
     model:Friend,attributes:['name','id']}
     ,attributes:['name','email','id'],
     raw:true}).then((users)=>{
  return res.status(201).json({users})
}).catch(function(err) {
  next(err)
});
}
const Login = async function(req,res){
  const email = req.body.email;
  const pass = req.body.password;
  const user =  await User.findAll({where:{email:email,password:pass},raw:true})
  
    // console.log(tokenList)
   if(user.length <= 0){
    return  res.json({result:"Sai tên đăng nhập hoặc mật khẩu "}) 
   }
   if (user.length <=0 && user[0].password !== pass) {
   return res.json({result:"Sai tên đăng nhập hoặc mật khẩu"})
  }
      //encode Token
      const token = encodeToken(user[0].id);
      const refreshToken = encodeTokenfresh(user[0].id);
      // Lưu lại 2 mã access & Refresh token, với key chính là cái refreshToken để đảm bảo unique và không sợ hacker sửa đổi dữ liệu truyền lên.
        tokenList[refreshToken] = {token, refreshToken};
  if (user.length>0) {

    res.setHeader("x-access-token",token)
    return res.status(200).json({result:true,token:token,refreshToken:refreshToken});
  }
      
}

const newFriend = async function(req,res,next){
  const { userID,friendID } = req.params
  const  email  = req.body.email
  const  name  = req.body.name

  const foundUser = await Friend.findAll({
    where:{
      UserId: userID,
      email:email
    }
  })
  
  if(foundUser.length > 0) return res.json({messenger:"Đã là bạn bè rồi  "})
  try {
   const newF = await Friend.create({
     name:name,
     UserId:userID,
     email:email,

   }) 
    res.json({newF})
  } catch (err)
   {
    next(err)
  }  
}


const getAllFriend = async(req,res,next)=>{
  const { userID } = req.params
 
try {
  const listFriend = await Friend.findAll({
    where:{
      UserId:userID
    },attributes:['name','email','id']
  })
  res.json({listFriend:listFriend})
} catch (error) {
  next(error)
}
}

const removeFriend = async(req,res,next)=>{
  const { userID,friendID } = req.params

  await Friend.destroy({
    where:{
      UserId:userID,
      id:friendID
    }
  }).then((deleteRecord)=>{
    if (deleteRecord===1) {
      res.status(200).json({mes:"Success"})
    } else {
      res.status(404).json({mes:"record not found"})
    }
  }).catch((error)=>{
    next(error)
  }
  )
}

const findUser = async function(req,res,next){
  const Op = Sequelize.Op;
  const { userID,friendID } = req.params
  const name = req.body.name;
  const listUser = await User.findAll({include:{model:Friend,attributes:['name','email']},where:{
    name:{
      [Op.like] : `%${name}%`
    }
  },raw:true})
   const listFriend = await Friend.findAll({
    where:{
      UserId:userID
    },attributes:['name','email','id'],raw:true
  })
// console.log(listFriend)
const arr = listFriend.map((item)=>{
  return item.email
})

const as = listUser.filter(item => arr.includes(item.email))
const diff = listUser.filter(item => !arr.includes(item.email))
const diffUserid = diff.filter((item)=>{
  return item.id !== userID
}) 
console.log(diffUserid)
res.json({Friend:as,notFriend:diffUserid}) 
   
}
const getchat = async(req,res,next)=>{
 
  
}
const addChat = async (req,res,next)=>{
  const userchat = req.params.userID
  const chatwith = req.params.friendID
  const content = req.body.content

  try {
      const mes = await Chat.create({
        text:content,
        UserId:userchat,
        UserChat:chatwith
      }).then((mes)=>{
        res.json({messenger:mes.text})

      }).catch((err)=>{
        next(err)
      })
      console.log(mes)
  } catch (error) {
    next(error)
  }   

 
}
const listMessenger = async (req,res,next)=>{
  const userchat = req.params.userID
  const chatwith = req.params.friendID
 const list = await Chat.findAll({
    group:['UserChat'],
    attributes: [[sequelize.fn('MAX', sequelize.col('id')), 'id']],
    raw:true,
})
  const arr = list.map((item)=>{
    return item.id
  })
  console.log(arr) 
  const lastchat=  await Chat.findAll({
    where: {
        id: {
          [Op.in]:arr
        },
        UserId:userchat
    }
})
res.json(lastchat)


}
const detailMes = async (req,res,next)=>{
  const userchat = req.params.userID
  const chatwith = req.params.friendID
  

    await Chat.findAll({
     where:{
       [Op.or]:[
        {UserId:userchat,UserChat:chatwith},
        {UserChat:userchat,UserId:chatwith},
       ]
     }
   }).then((detail)=>{
     res.json({detail})
   }). catch((error)=> {
    next(error)
  })
}

module.exports = {
  Login, newUser, newFriend, getAllFriend, removeFriend, findUser, encodeToken ,encodeTokenfresh,verifyToken,refreshtoken, addChat, getchat
  ,listMessenger, detailMes, GetAllUser
}