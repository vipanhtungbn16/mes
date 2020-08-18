const express = require('express');
const router = require("express-promise-router")()
const userController = require('../Controller/user')
// const checkLogin = require("../middleware/checkLogin");
// const checkLogout = require("../middleware/checkLogout");
// const check = require("../middleware/checkToken");
const Check = require('../middleware/checkToken');


router.post('/singup',userController.newUser)
router.route('/singin').post(userController.Login)
router.route('/refresh-token').post(userController.refreshtoken)
router.route('/getall').get(userController.GetAllUser)
router.use('/',Check)
// router.use("/",checkLogout)
// router.get("/logout",userController.logout)
router.route('/:userID/newFriend').post(userController.newFriend)
router.route('/:userID/find').get(userController.findUser)
router.route('/:userID/friend').get(userController.getAllFriend)
router.route('/:userID/:friendID/remove').post(userController.removeFriend)
router.route('/:userID/:friendID/chatadd').post(userController.addChat)
router.route('/:userID/getlistmes').get(userController.listMessenger)
router.route('/:userID/:friendID/detailmes').get(userController.detailMes)





module.exports = router
