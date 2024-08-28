const { default: mongoose } = require("mongoose")
const upload = require("../middleware/multer")
const productHelper = require("../helpers/product")
const userHelper = require("../helpers/users")
const adminHelper = require("../helpers/admin")
const couponHelper = require("../helpers/coupon")
// const { compare } = require("bcrypt")

// --------------------------------------admin side:

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
    console.log("error in admin login:"+error)
  }
}

// function insertAdmin(){
//   const newad = new Admin({name:"sreeraj" , password:1234})
//    newad.save().then(response=> {console.log(response)})
// }
// insertAdmin()

// view whole admin dashboard 
const index = (req, res) => {
  res.render("admin/index")
}

// --------------------------------------product side:

// view products list >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const viewProducts = async (req, res) => {
  try {
    const products = await productHelper.viewProduct()
    res.render("admin/product", { products: products })
  } catch (error) {
    console.log(error);
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
      console.log(error);
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
    console.error('Error activating product:', error);
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
    console.error('Error inactivating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// get editProductPage >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const editProductPage = async (req, res) => {
  const productId = req.query.id
  const product = await productHelper.getEditPage(productId)
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
      console.log("error in updating product")
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
    console.log(error)
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
    console.log(error);
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
    console.error('Error toggling user status:', error);
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
    console.error('Error searching users:', error);
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
    console.error('Error in deleting :',error);
    res.status(500).json({error:"internal server error"})
  }
}

//  coupon users >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const couponPage = async (req,res)=>{
  try{
    const coupons = await couponHelper.getCoupon()    
    res.render("admin/coupon",{coupons})
  }catch(error){
    console.error('Error in rendering couponPage :',error);
  }
}

const addCoupon = async (req, res)=>{
  try{    
    await couponHelper.addNewCoupons(req.body)
    res.redirect("/admin/coupon")
  }catch(error){
    console.error('Error in adding coupons :',error);
  }
}

const editCouponPage = async (req,res)=>{
  try{
    const couponId = req.query.q
    console.log("coupon:",couponId);
    
    const coupon = await couponHelper.getOneCoupon(couponId)
    res.render("admin/coupon",{coupon})
  }catch(error){
    console.error('Error in editing coupons :',error);
  }
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
  editCouponPage
};


// notes:
// to add a field in mongodb document:-
// function insertP() {
//   Product.updateMany({}, {
//    $set: {"isActive": true}
//   }).then(response=> {console.log(response)})
// }
// insertP()

// for redirecting:-
// res.redirect("/admin/addProduct")
