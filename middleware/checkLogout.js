module.exports = (req,res,next)=>{
  if(!req.session.user){
    return res.json({result:"yêu cầu đăng nhập "})
  }
  next();
}