const { default: mongoose } = require("mongoose")
const upload = require("../middleware/multer")
const bannerUpload = require("../middleware/multerBanner")
const productHelper = require("../helpers/product")
const userHelper = require("../helpers/users")
const adminHelper = require("../helpers/admin")
const couponHelper = require("../helpers/coupon")
const orderHelper = require("../helpers/order")
const returnHelper = require("../helpers/return")
const cancelHelper = require("../helpers/cancel")
const bannerHelper = require("../helpers/banner")
const Order = require("../models/order")
const moment = require('moment'); // To handle dates easily
const logger = require("../utils/logger");



// admin login get >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const loginPage =  (req,res)=>{
  if(!req.session.admin){
  res.render("admin/adminLogin")
  }else{
    res.redirect("/admin")
  }
}

// admin login post >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const login = async(req,res)=>{
  const {name,password} = req.body
  try{
    const admin = await adminHelper.findAdmin(name)
    if(!admin){
      return res.render("admin/adminLogin",{errorMsg:"user not found"})
    }
    const matchPaswd = await admin.comparePassword(password)
    if(!matchPaswd){
      return res.render("admin/adminLogin",{errorMsg:"Wrong Password"})
    }
    req.session.admin = admin;
    req.session.loggedIn = true;
    req.session.adminName = admin.name

    return res.redirect("/admin")
  }catch(error){
    logger.error("error in admin login:"+error)
  }
}

// function insertAdmin(){
//   const newad = new Admin({name:"srj" , password:fjrt})
//    newad.save().then(response=> {logger.error(response)})
// }
// insertAdmin()

// view whole admin dashboard >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const index = async (req, res) => {
  try {
    const todayStart = moment().startOf('day'); 
    const todayEnd = moment().endOf('day'); 

    const allOrders = await Order.find();

    const todayOrders = await Order.find({
      datePlaced: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
    });

    const totalSale = allOrders.length;

    const todaySale = todayOrders.length;

    // Calculate Total Revenue (sum of finalAmount in delivered orders)
    const totalRevenue = allOrders
      .filter(order => order.orderStatus === "Delivered")
      .reduce((sum, order) => sum + order.finalAmount, 0);

    // Calculate Today Revenue (sum of finalAmount in today’s orders)
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    // Prepare 12 months of data, initializing each month to zero
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: moment().month(i).format("MMM"), 
      totalSales: 0,
      totalRevenue: 0,
    }));

    // Update monthlyData with actual values from orders
    allOrders.forEach(order => {
      if (order.orderStatus === "Delivered") {
        const monthIndex = new Date(order.datePlaced).getMonth();
        monthlyData[monthIndex].totalSales += 1;
        monthlyData[monthIndex].totalRevenue += order.finalAmount;
      }
    });

    // Prepare months, salesData, and revenueData for the chart
    const months = monthlyData.map(data => data.month);
    const salesData = monthlyData.map(data => data.totalSales);
    const revenueData = monthlyData.map(data => data.totalRevenue);

    // Render the dashboard page, passing calculated data
    res.render('admin/index', {
      totalSale,
      todaySale,
      totalRevenue,
      todayRevenue,
      months,
      salesData,
      revenueData,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send("Server Error");
  }
};


// --------------------------------------product side:

// view products list >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const viewProducts = async (req, res) => {
  try {
    const products = await productHelper.viewProduct()
    res.render("admin/product", { products: products })
  } catch (error) {
    logger.error(error);
  }
}

// post addProducts >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const addProduct = async (req, res) => {
  const uploadMiddleware = upload.array("images", 10);
  
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try {
      const images = req.files.map(file => file.filename)
      // const images = req.files.map(file=>`/uploads/${file.filename}`)

      const newProduct = await productHelper.addProducts(req.body, images)

      res.status(200).json({ success: true, message: 'Product uploaded successfully' });

    } catch (error) {
      logger.error(error);
      res.status(500).json({ success: false, message: "Error in uploading product" })
    }
  })
}

// get addProduct page >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const addProductPage = (req, res) => {
  res.render("admin/addProduct");
}

//To Active-products >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const productActive = async (req, res) => {
  const productId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }
    const product = await productHelper.activateProduct(productId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });

  } catch (error) {
    logger.error('Error activating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//To InActive-products >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const productInactive = async (req, res) => {
  const productId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }
    const product = await productHelper.inactivateProduct(productId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });

  } catch (error) {
    logger.error('Error inactivating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// get editProductPage >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const editProductPage = async (req, res) => {
  const productId = req.query.id
  const product = await productHelper.viewSingleProduct(productId)
  if (!product) {
    return res.status(404).json({ error: "product not found" })
  }
  res.render("admin/editProduct", { product })
}

// post editedProduct >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const editProduct = async (req, res) => {

  const uploadMiddleware = upload.array("images", 10);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try {
      const productId = req.query.id
      const image = req.files.map(file => file.filename)
      const product = await productHelper.updateProduct(productId,image,req.body)
      if (!product) {
        return res.status(500).json({ success: false, message: "Product not updated" });
      }
      res.json({ success: true, message: "Product updated successfully" });

    } catch (error) {
      logger.error("error in updating product")
      res.status(500).json({ success: false, message: "Error in updating product" });
    }
  })
}

// search &filter products >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const searchProducts = async(req,res)=>{
  const query= req.query.q
  const category = req.query.category
  const status = req.query.status

  let searchCriteria = {
    $or:[
      {name:{$regex:`^${query}`,$options:'i'}},
      {category:{$regex:`^${query}`,$options:'i'}}
      // { brand: new RegExp(query,'i') }, -this workes well it is taken from cgpt but it breaks nodemon as we type "{,[,#,etc"
    ]
  }

  if(category){
    searchCriteria.category = category
  }

  if(status){
    searchCriteria.isActive = status
  }

try{
  const products = await productHelper.searchProduct(searchCriteria)
  res.json({ products }); 
}catch(error){
    logger.error(error)
    res.status(500).json({success:false,message:"Error searching products"})
  }
}

// --------------------------------------users side:


// view users list page >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const allUsers = async (req, res) => {
  try {
    const users = await userHelper.findUsers();
    res.render("admin/users", { users });
  } catch (error) {
    logger.error(error);
  }
};

// block&unblock users  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const userStatus = async(req,res)=>{
  const userId = req.query.id
  const {isBlocked} = req.body

  try{
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await userHelper.toggleStatus(userId,isBlocked)

    if(!user){
      return res.status(500).json({error:"user not found"})
    }
    res.json({success:true,user})
  }catch(error){
    logger.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// search &filter users >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const searchUser = async (req,res)=>{
  const query = req.query.q
  const status = req.query.status
  try{
    let searchCriteria = {
      $or:[
        {name:{$regex:`^${query}`,$options:'i'}},
        // {address:{$regex:`^${query}`,$options:'i'}}
      ]
    } 
    if(status){
      searchCriteria.isBlocked = status
    }

    const users = await userHelper.searchAndFilter(searchCriteria)

    if(!users){
      return res.status(404).json({error:"user not found"})
    }
    res.json({users})
  }catch(error){
    logger.error('Error searching users:', error);
    res.status(500).json({error:"internal server error"})
  }
}

//  delete users >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const deleteUser = async (req ,res) =>{
  const id = req.query.id;
  try{
  const user = await userHelper.removeUser(id)
  if(!user){
    res.status(404).json({error:"user not found"})
  }
  res.json({success:true,user})
  }catch(error){
    logger.error('Error in deleting :',error);
    res.status(500).json({error:"internal server error"})
  }
}

//  coupon users >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const couponPage = async (req,res)=>{
  try{
    const coupons = await couponHelper.getAllCoupons()    
    res.render("admin/coupon",{coupons})
  }catch(error){
    logger.error('Error in rendering couponPage :',error);
  }
}

const addCoupon = async (req, res)=>{
  try{    
    await couponHelper.addNewCoupons(req.body)
    res.redirect("/admin/coupon")
  }catch(error){
    logger.error('Error in adding coupons :',error);
  }
}

const editCoupon = async(req,res)=>{
  try{
  const couponId = req.body.id
  const updatedData = {
    code:req.body.code,
    description:req.body.description,
    discount:req.body.discount,
    discountType:req.body.discountType,
    usageCount:req.body.usageCount,
    minPriceRange:req.body.minPriceRange,
    maxPriceRange:req.body.maxPriceRange,
    expireDate:req.body.expireDate
  }
  await couponHelper.updateCoupon(couponId,updatedData)
  res.redirect("/admin/coupon")
  }catch(error){
    logger.error("Error on editng coupon :", error)
  }
}

const deleteCoupon = async (req,res)=>{
  try{
    const couponId = req.query.id
    await couponHelper.removeCoupon(couponId)
    res.redirect("/admin/coupon")
  }catch(error){
    logger.error("Error on deleting coupon :", error)
  }
}

// orders section  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const viewOrders = async(req, res) => {
  const orders = await orderHelper.findOrders() 
  res.render("admin/orders",{orders})
}

const updateStatus = async(req,res)=>{
  try{
  const {Id} = req.params
  const {status} = req.body
  
  await orderHelper.updateOrderStatus(Id,{orderStatus:status})
  res.json({success:true})
  }catch(error){
    logger.error('Error updating order status:', error);
    res.json({success:false})
  }
}


const filterOrders = async (req, res) => {
  const { search, status, payment } = req.query;
  let query = {};

  if (search) {
    query.orderId = { $regex: search, $options: "i" };
  }

  if (status) {
    query.orderStatus = status;
  }

  if (payment) {
    query.paymentType = payment;
  }

  try {
    const orders = await orderHelper.filterOrdersHelper(query);
    res.json({ orders });
  } catch (error) {
    logger.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// return section  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const returnOrders = async (req,res)=>{
  try {
    const orders = await returnHelper.getOrdersWithReturns();

    res.render('admin/returns', { orders });
  } catch (error) {
    logger.error('Error fetching return orders:', error);
    res.status(500).send('Server error');
  }
}

const updateReturnStatus = async (req, res) => {
  try {
    const { returnId, newStatus } = req.body; 
    const success = await returnHelper.updateReturnStatuses(returnId, newStatus);

    if (success) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    logger.error('Error updating return status:', error);
    res.status(500).json({ success: false });
  }
};

const cancellations = async (req,res)=>{
  try{
    const orders = await cancelHelper.getCancelledOrders()
    res.render("admin/cancellations",{orders})
  }catch(error){
    logger.error('Error getting cancellations page:', error);
  }
}

// banner section  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const banners = async(req,res)=>{
  const mainBanners = await bannerHelper.findMainBanner()
  const brandBanners = await bannerHelper.findBrandBanner()
  const midBanners = await bannerHelper.findMidBanner()
  const bottomBanners = await bannerHelper.findBottomBanner()

  res.render("admin/banners",{mainBanners,brandBanners,midBanners,bottomBanners})
}

const addMainBanner = async (req,res)=>{
  const uploadMiddleware = bannerUpload.single("image");
  
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try {
      const image = req.file ? `/uploads/banners/${req.file.filename}` : null;

      await bannerHelper.addMainBanners(req.body, image)

      res.redirect('/admin/banners');
      // res.status(200).json({ success: true, message: 'Product uploaded successfully' });

    } catch (error) {
      logger.error(error);
      // res.status(500).json({ success: false, message: "Error in uploading product" })
    }
  })
}

const addBrandBanner = async (req,res)=>{
  const uploadMiddleware = bannerUpload.single("image")

  uploadMiddleware(req,res ,async (err)=>{
    if (err) {
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try{
      const image = req.file ? `/uploads/banners/${req.file.filename}` :null

      await bannerHelper.addBrandBanners(req.body.displayOrder,image)

      res.redirect('/admin/banners')
    }catch(error){
      logger.error(error);
      // res.status(500).json({ success: false, message: "Error in uploading product" })      
    }
  })
}

const addMidBanner = async (req,res)=>{
  const uploadMiddleware = bannerUpload.single("image")

  uploadMiddleware(req,res ,async(err)=>{
    if(err){
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try{
      const image = req.file ? `/uploads/banners/${req.file.filename}` :null
      await bannerHelper.addMidBanners(req.body ,image)
      res.redirect("/admin/banners")
    }catch(error){
      logger.error(error);
    }
  })
}


const addBottomBanner = async (req,res)=>{
  const uploadMiddleware = bannerUpload.single("image")

  uploadMiddleware(req,res ,async(err)=>{
    if(err){
      return res.status(500).json({ success: false, message: "Error in uploading images" });
    }
    try{
      const image = req.file ? `/uploads/banners/${req.file.filename}` :null
      await bannerHelper.addBottomBanners(req.body ,image)
      res.redirect("/admin/banners")
    }catch(error){
      logger.error(error);
    }
  })
}

// 404 not found page >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const notFound = (req, res) => {
  res.render("admin/404")
}
// logout   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const logout =(req,res)=>{
  req.session.destroy()
  res.redirect("/admin/login")
}

module.exports = {
  loginPage,
  index,
  viewProducts,
  addProductPage,
  addProduct,
  productActive,
  productInactive,
  editProductPage,
  editProduct,
  searchProducts,
  allUsers,
  userStatus,
  searchUser,
  deleteUser,
  login,
  logout,
  notFound,
  couponPage,
  addCoupon,
  editCoupon,
  deleteCoupon,
  viewOrders,
  updateStatus,
  filterOrders,
  returnOrders,
  updateReturnStatus,
  cancellations,
  banners,
  addMainBanner,
  addBrandBanner,
  addMidBanner,
  addBottomBanner
};


// notes:
// to add a field in mongodb document:-
// function insertP() {
//   Product.updateMany({}, {
//    $set: {"isActive": true}
//   }).then(response=> {logger.error(response)})
// }
// insertP()

// for redirecting:-
// res.redirect("/admin/addProduct")
