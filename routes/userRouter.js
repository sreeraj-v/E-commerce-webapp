const router = require("express").Router();
const { registeration, verifyEmail, registerPage, home, loginPage, userLogin, logout, productView, shop, addToCart, cart, removeFromCart, updateQuantity, checkOut, addNewAddress, applyCoupon, confirmOrderPayment, processOrder, downloadInvoice,  } = require("../controllers/user")
const userAuth = require("../middleware/userAuth")

router.get("/login",loginPage)
router.post("/login",userLogin)
router.get("/register",registerPage)
router.post("/register",registeration)
router.get("/verify-email",verifyEmail)
router.get("/",home)
router.get("/productView",productView)
router.get("/shop",shop);
router.get("/addToCart",addToCart);
router.get("/cart",cart)
router.get("/removeFromCart",removeFromCart)
router.post("/updateQuantity",updateQuantity)
router.get("/checkOut", userAuth, checkOut);
router.post("/addNewAddress", userAuth, addNewAddress);
router.post("/applyCoupon",userAuth,applyCoupon)
router.post('/processOrder', processOrder);
router.get('/orderSuccess', confirmOrderPayment);
router.get("/download-invoice/:orderId",downloadInvoice);


router.get("/myaccount", (req, res) => {
  res.render("user/myaccount");
});





// router.get("/orderSuccess", (req, res) => {
//   res.render("user/orderSuccess");
// });

router.get("/wishlist", (req, res) => {
  res.render("user/wishlist");
});
router.get("/logout",logout)



// user waste  
 
module.exports = router;
