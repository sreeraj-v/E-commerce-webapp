const nodemailer = require("nodemailer");
const crypto = require("crypto")
const transporter = require("../config/nodemailer/emailer");
const userSchema = require("../models/userSchema");
const productHelper = require("../helpers/product")
const cartHelper = require("../helpers/cart")
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
    const dbEmail = await userSchema.findOne({ email: email })
    if (!dbEmail) {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 3600000;
      const user = new userSchema({
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
    const user = await userSchema.findOne({verifyToken:token,tokenExpiry:{$gt:Date.now()}})
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
    const user = await userSchema.findOne({ email: email, isVerified: true });
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
  try {
    const products = await productHelper.shopProducts();
    res.render("user/index", { products: products });
  } catch (error) {
    console.log(error);
  }
};
//  this is last working
const productView = async (req, res) => {
  const productId = req.query.q;
  const userId = req.session.user ? req.session.user._id : null;

  try {
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }

    const category = product.category;
    const relatedProducts = await productHelper.relatedProduct(category);

    let cart = { items: [] };
    if (userId) {
      const userCart = await cartHelper.getCart(userId);
      if (userCart) {
        cart = userCart;
      }
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const isInCart = cart.items.some(item => String(item.productId) === String(productId));

    res.render("user/productView", { product, isInCart, relatedProducts });
  } catch (error) {
    console.error(error);
    res.redirect("/500error");
  }
};


const shop = async (req,res) =>{
  try{
    const products = await productHelper.shopProducts()
    if(products){
      res.render("user/shop",{products})
    }
  }catch(error){
    console.log(error)
  }
}

// add to cart   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const addToCart = async (req, res) => {
  const productId = req.query.q;
  const userId = req.session.user ? req.session.user._id : null;
  const guestCart = req.session.cart || { items: [] };

  try {
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }

    if (userId) {
      await cartHelper.addProductToCart(userId, product);
    } else {
      const itemIndex = guestCart.items.findIndex(item => String(item.productId) === String(product._id));
      if (itemIndex === -1) {
        guestCart.items.push({
          productId: product._id,
          price: product.price,
          quantity: 1,
          total: product.price,
        });
      }
      req.session.cart = guestCart;
    }

    res.redirect("/cart");
  } catch (error) {
    console.error(error);
    res.redirect("/500error");
  }
};


const cart = async (req, res) => {
  const userId = req.session.user ? req.session.user._id : null;

  let cart = { items: [] };
  if (userId) {
    cart = await cartHelper.getCart(userId);
  } else if (req.session.cart) {
    cart = req.session.cart;
  }

  res.render("user/cart", { cart });
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
  logout,
};


// doubts
// const { error } = require("console");
