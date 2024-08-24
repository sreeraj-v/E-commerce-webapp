const userAuth = (req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect("/register")
  }
}

module.exports = userAuth;