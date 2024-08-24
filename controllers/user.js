const nodemailer = require("nodemailer");
const crypto = require("crypto")
const transporter = require("../config/nodemailer/emailer");
// const {User} = require("../models/userSchema");
const productHelper = require("../helpers/product")
const cartHelper = require("../helpers/cart")
const { Address, User } = require("../models/userSchema");

require('dotenv').config()

// registeration post route

async function registeration(req, res) {
  try {
    const { name, email, phone, password } = req.body
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      return res.render("user/register", { errorMsg: "all fields are required" });
    }
    if (phone.length < 8 || phone.length > 10) {
      return res.render("user/register", { errorMsg: "Phone number must be 10 to 12 digits", });
    }
    if (name.length < 4 || name.length > 20) {
      return res.render("user/register", { errorMsg: "name should not be less than 4 or greater than 20" });
    }
    if (email.length < 7 || email.length > 100) {
      return res.render("user/register", { errorMsg: "email should not be less than 7 or greater than 100" })
    }
    if (password.length < 4) {
      return res.render("user/register", { errorMsg: "password must be more than 4 characters" })
    }
    const dbEmail = await User.findOne({ email: email })
    if (!dbEmail) {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 3600000;
      const user = new User({
        name,
        phone,
        password,
        email,
        verifyToken,
        tokenExpiry
      })
      await user.save()

      const verificationLink = `http://localhost:3000/verify-email?token=${verifyToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Welcome to Atherton shop :) ,Click <a href="${verificationLink}">here</a> to verify your email.</p>`
      }
      console.log('verification send')
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.render("user/register", { errorMsg: "Error sending verification email" })
        } else {
          console.log('Email sent: ' + info.response);
          return res.render("user/register", { errorMsg: "Verification email sent. Please check your inbox." });
        }
      })
      console.log('verification send -2')
    } else {
      return res.render("user/register", { errorMsg: "user already exists kindly login" })
    }
  } catch (error) {
    console.log(error);
    return res.render("user/register", { errorMessage: "An error occurred during registration" });
  }
}

// Email verification route

const verifyEmail = async  (req,res)=>{
  console.log('verification link clicked')
  try{
    const {token} = req.query
    const user = await User.findOne({verifyToken:token,tokenExpiry:{$gt:Date.now()}})
    if(!user){
      return res.render("user/register",{errorMsg:"Invalid or expired token"})
    }
    user.isVerified = true
    user.verifyToken = undefined
    user.tokenExpiry = undefined
    await user.save()
    
    req.session.user = user
    req.session.loggedIn = true
    req.session.name = user.name
    console.log("user created and signuped");
    return res.redirect("/");
  }catch(error){
    console.log(error)
    return res.render("user/register",{errorMsg:"error verifying in account"})
  }
}

// register page getting route

const registerPage = (req,res)=>{
  if(req.session.user){
    res.redirect("/")
  }else{
    res.render("user/register")
  }
}

// login post route

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    
    const user = await User.findOne({ email: email, isVerified: true });
    if (!user) {
      console.log("wrong email or isVerified false ");
      return res.render("user/login", { errorMsg: "invalid Email" });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      console.log(user.name + " : login successfully");
      req.session.user = user;
      req.session.loggedIn = true;
      req.session.username = user.name;
      if (req.session.user) {
        console.log("user login success");
        return res.redirect("/");
      }
    } else {
      console.log("password is wrong");
      return res.render("user/login", { errorMsg: "invalid password" });
    }
  } catch (error) {
    console.log(error);
  }
}

// login page getting route

const loginPage = async (req,res)=>{
  if(req.session.user){
    return res.redirect('/')
  }
  else{
   return res.render('user/login')
  }}

// home page getting route

const home = async (req, res) => {
  const userId = req.session.user ? req.session.user._id : null
  try {
    const products = await productHelper.shopProducts();

    let cart = {items:[]};
    if(userId){
      cart = await cartHelper.getCart(userId)
      if(!cart){
        cart = {items:[]}
      }
    }else if(req.session.cart){
      cart = req.session.cart
    }

    const IsProductInCart = products.map(product => {
      const isInCart = cart.items.some(item => String(item.productId._id || item.productId) === String(product._id));
      return { ...product, isInCart }; // Add isInCart to each  product
    });

    res.render("user/index", { products: IsProductInCart });
  } catch (error) {
    console.log(error);
  }
};

const productView = async (req, res) => {
  const productId = req.query.q
  console.log("id", productId)
  const userId = req.session.user ? req.session.user._id : null;

  try {
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }
    const relatedProducts = await productHelper.relatedProduct( product.category);

    let cart = { items: [] };
    if (userId) {
       cart = await cartHelper.getCart(userId);
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const isInCart = cart.items.some(item => String(item.productId._id || item.productId) === String(productId));
    // cart.items.forEach((item) => {
      //   console.log(item.productId);
      // });
      // console.log(productId)
      // console.log(isInCart)

    const isRelatedProductsInCart = relatedProducts.map(relatedProduct => {
      const isInCart = cart.items.some(item => String(item.productId._id || item.productId) === String(relatedProduct._id));
      return { ...relatedProduct, isInCart }; // Add isInCart to each related product
    });
    res.render("user/productView", { product, isInCart,relatedProducts:isRelatedProductsInCart });
  } catch (error) {
    console.log(error);
    res.redirect("/500error");
  }
};



const shop = async (req,res) =>{
  const userId = req.session.user ? req.session.user._id : null
  try{
    const products = await productHelper.shopProducts()
    
    let cart = {items : []}
    if(userId){
      cart = await cartHelper.getCart(userId)
    }else if (req.session.cart){
      cart = req.session.cart
    }

    const IsProductInCart = products.map(product => (
      {...product,isInCart:cart.items.some(item => String(item.productId._id || item.productId) === String(product._id))}
  ))

    res.render("user/shop",{products:IsProductInCart})
  }catch(error){
    console.log(error)
  }
}

// add to cart   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const addToCart = async (req, res) => {
  try {
    const productId = req.query.q;
    
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }

    if (req.session.user) {
      await cartHelper.addProductToCart(req.session.user._id, product);
    } else {
      let guestCart = req.session.cart || { items: [] };
      guestCart = cartHelper.addToGuestCart(guestCart, product);
      req.session.cart = guestCart;
    }

    res.redirect("/cart");
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Internal server error');
  }
};


const cart = async (req, res) => {
  try {
    let cartItems = [];
    let totalCartValue = 0;

    if (req.session.user) {
      const userCart = await cartHelper.getCart(req.session.user._id);

      if (!userCart || userCart.items.length === 0) {
        return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
      }

      cartItems = userCart.items;
      totalCartValue = cartItems.reduce((total,item)=> total+item.total,0).toFixed(2)
    } else {
      const guestCart = req.session.cart || { items: [] };

      if (guestCart.items.length === 0) {
        return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
      }

      const productDetails = await productHelper.getProductDetails(
        guestCart.items.map(item => item.productId)
      );

      cartItems = guestCart.items.map(item => {
        const product = productDetails.find(prod => prod._id.toString() === item.productId);
        return { 
          productId: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image
          },
          quantity: item.quantity,
          total: item.total
        };
      });
      totalCartValue = cartItems.reduce((total,item)=> total+item.total,0).toFixed(2)
    }

    res.render('user/cart', { products: cartItems ,totalCartValue});
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
  }
};

const removeFromCart = async(req,res)=>{
  const productId = req.query.q
  
  try{
    if(req.session.user){
      console.log(productId);
      await cartHelper.removeProduct(productId,req.session.user._id)
    }else{
      const guestCart = req.session.cart || {items:[]}
      req.session.cart.items = guestCart.items.filter(item=>item.productId!==productId)
    }
    res.redirect("/cart")
  }catch(error){
    console.error('Error fetching cart details:', error);
    res.status(500).send('Internal server error');
  }
}

const updateQuantity = async (req,res)=>{
  try {
    const { productId, quantity,price } = req.body;
    const userId = req.session.user?req.session.user._id : null

    if (req.session.user) {
        await cartHelper. updateProductQuantity(userId,productId,quantity,price)
    } else {
        let guestCart = req.session.cart || { items: [] };
        const item = guestCart.items.find(item => item.productId === productId);

        if (item) {
            item.quantity = parseInt(quantity);
            item.total = item.price * item.quantity;
        }

        req.session.cart = guestCart;
    }

    res.json({ success: true });

} catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ error: 'Failed to update cart quantity' });
}
}

// checkOut    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const checkOut = async (req, res) => {
  try {
      const userId = req.session.user._id; // Assuming user is authenticated and user object is available in req
      const addresses = await Address.find({ userId });

      res.render("user/checkout", {
          addresses,
          user: req.session.user, // Pass user details for creating a new address
      });
  } catch (error) {
      console.error("Error fetching addresses: ", error);
      res.status(500).send("Internal Server Error");
  }
};

const addNewAddress = async (req, res) => {
  try {
      const userId = req.session.user._id; // Assuming user is authenticated and user object is available in req
      const addressData = {
          firstName: req.body.firstName || req.session.user.name.split(" ")[0],
          lastName: req.body.lastName || req.session.user.name.split(" ")[1],
          streetAddress: req.body.streetAddress,
          city: req.body.city,
          country: req.body.country,
          pincode: req.body.pincode,
          phone: req.body.phone || req.session.user.phone,
          email: req.body.email || req.session.user.email
      };

      await addressHelper.createAddress(userId, addressData);
      res.redirect("/checkOut");
  } catch (error) {
      console.error("Error adding new address: ", error);
      res.status(500).send("Internal Server Error");
  }
};

const logout = (req,res)=>{
  req.session.destroy()
  res.redirect("/login")
}


module.exports = {
  registeration,
  verifyEmail,
  registerPage,
  home,
  loginPage,
  userLogin,
  productView,
  shop,
  addToCart,
  cart,
  removeFromCart,
  updateQuantity,
  checkOut,
  addNewAddress,
  logout,
};


// doubts
// const { error } = require("console");
