const router = require("express").Router()

const { index, addProductPage, addProduct, viewProducts, productActive, productInactive, notFound, editProductPage, editProduct, searchProducts, allUsers, userStatus, searchUser, deleteUser, loginPage, login, logout, couponPage, addCoupon, editCoupon, deleteCoupon, viewOrders, } = require("../controllers/admin");
const adminAuth = require("../middleware/adminAuth");

// admin login get
router.get("/login",loginPage)
// admin login post
router.post("/login",login)
// admin home page
router.get("/",adminAuth,index);
// view products list
router.get("/product",adminAuth,viewProducts);
// view add product page
router.get("/addProduct",adminAuth,addProductPage);
// post add product 
router.post("/addProduct",adminAuth,addProduct)
// activating products
router.post("/productActive/:id",adminAuth,productActive)
// inactivating products
router.post("/productInactive/:id",adminAuth,productInactive)
// get edit a product
router.get("/editProduct",adminAuth,editProductPage)
// post editted product
router.post("/editProduct",adminAuth,editProduct)
// searchProducts
router.get("/searchProducts",adminAuth,searchProducts)
// view all users
router.get("/allUsers",adminAuth,allUsers)
// block or unblock user
router.post("/userStatus",adminAuth,userStatus)
// searchUsers
router.get("/searchUser",adminAuth,searchUser)
// delete user
router.post("/deleteUser",adminAuth,deleteUser)
// get coupon page
router.get("/coupon" ,adminAuth,couponPage);
// post add coupon
router.post("/addCoupon" ,adminAuth,addCoupon)
// post edit coupon
router.post("/editCoupon",adminAuth,editCoupon)
// delete coupon
router.get("/deleteCoupon",adminAuth,deleteCoupon)

router.get("/orders",adminAuth,viewOrders);

// logout
router.get("/logout",logout)
// 404 not found
router.get("/notfound",notFound) 



module.exports = router