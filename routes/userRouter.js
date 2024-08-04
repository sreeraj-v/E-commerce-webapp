const router = require("express").Router();
const { registeration, verifyEmail, registerPage, home, loginPage, userLogin, logout, productView, shop } = require("../controllers/user")

router.get("/login",loginPage)
router.post("/login",userLogin)
router.get("/register",registerPage)
router.post("/register",registeration)
router.get("/verify-email",verifyEmail)
router.get("/",home)
router.get("/productView",productView)
router.get("/shop",shop);

router.get("/myaccount", (req, res) => {
  res.render("user/myaccount");
});

router.get("/cart", (req, res) => {
  res.render("user/cart");
});

router.get("/checkout", (req, res) => {
  res.render("user/checkout");
});

router.get("/wishlist", (req, res) => {
  res.render("user/wishlist");
});
router.get("/logout",logout)



// user waste  
 
module.exports = router;
