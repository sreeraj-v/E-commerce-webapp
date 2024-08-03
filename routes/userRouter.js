const router = require("express").Router();
const { registeration, verifyEmail, registerPage, home, loginPage, userLogin, logout, productView } = require("../controllers/user")

router.get("/login",loginPage)
router.post("/login",userLogin)
router.get("/register",registerPage)
router.post("/register",registeration)
router.get("/verify-email",verifyEmail)
router.get("/",home)
router.get("/productView",productView)

router.get("/myaccount", (req, res) => {
  res.render("user/myaccount");
});

// router.get("/productView", (req, res) => {
//   res.render("user/productView");
// });

router.get("/shop", (req, res) => {
  res.render("user/shop");
});

router.get("/wishlist", (req, res) => {
  res.render("user/wishlist");
});
router.get("/logout",logout)



// user waste  
 
module.exports = router;
