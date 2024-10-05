const router = require("express").Router();
const { registeration, verifyEmail, registerPage, home, loginPage, userLogin, logout, productView, shop, addToCart, cart, removeFromCart, updateQuantity, checkOut, addNewAddress, applyCoupon, confirmOrderPayment, processOrder, downloadInvoice, myaccount, returnProduct, cancelOrder, addToWishlist, getWishlist, removeFromWishlist, forgotPassword, resetPassword, submitResetPassword,  } = require("../controllers/user")
const userAuth = require("../middleware/userAuth")

router.get("/login",loginPage)
router.post("/login",userLogin)
router.get("/register",registerPage)
router.post("/register",registeration)
router.get("/verify-email",verifyEmail)
router.post("/forgot-password",forgotPassword );
router.get("/reset-password",resetPassword);
router.post("/reset-password",submitResetPassword);

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
router.get('/orderSuccess',userAuth, confirmOrderPayment);
router.get("/download-invoice/:orderId",userAuth,downloadInvoice);
router.get("/myaccount",userAuth,myaccount);
router.post("/return", returnProduct);
router.post('/cancelOrder',cancelOrder )
router.post('/addToWishlist', addToWishlist);
router.get("/wishlist",userAuth,getWishlist)
router.get("/removeFromWishlist",removeFromWishlist)





// router.get("/wishlist", (req, res) => {
//   res.render("user/wishlist");
// });
router.get("/logout",logout)



// user waste  
 
module.exports = router;
