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
// const productView = async (req, res) => {
//   const productId = req.query.q;
//   const userId = req.session.user ? req.session.user._id : null;

//   try {
//     const product = await productHelper.viewSingleProduct(productId);
//     if (!product) {
//       return res.redirect("/404notfound");
//     }

//     const category = product.category;
//     const relatedProducts = await productHelper.relatedProduct(category);

//     let cart = { items: [] };
//     if (userId) {
//       const userCart = await cartHelper.getCart(userId);
//       if (userCart) {
//         cart = userCart;
//       }
//     } else if (req.session.cart) {
//       cart = req.session.cart;
//     }

//     const isInCart = cart.items.some(item => item.productId.toString() === productId);

//     res.render("user/productView", { product, isInCart, relatedProducts });
//   } catch (error) {
//     console.log(error);
//     res.redirect("/500error");
//   }
// };

const productView = async (req, res) => {
  const productId = req.query.q;
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
      // if (userCart) {
      //   cart = userCart;
      // }
    } else if (req.session.cart) {
      cart = req.session.cart;
    }

    const isInCart = cart.items.some(item => String(item.productId._id || item.productId) === String(productId));
    console.log(isInCart)
    // cart.items.forEach((item) => {
    //   console.log(item.productId);
    // });
    console.log(productId)

    res.render("user/productView", { product, isInCart,relatedProducts });
  } catch (error) {
    console.log(error);
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

// const addToCart = async (req, res) => {
//   try {
//     const { q: productId } = req.query;

//     if (!productId) {
//       return res.status(400).send('No product ID provided');
//     }

//     const product = await productHelper.viewSingleProduct(productId);
//     if (!product) {
//       return res.status(404).send('Product not found');
//     }

//     if (req.session.user) {
//       // User is logged in, handle user cart
//       const userId = req.session.user._id;
//       await cartHelper.addProductToCart(userId, product);
//     } else {
//       // User is not logged in, handle guest cart using session
//       let guestCart = req.session.cart || { items: [] };

//       const productInCart = guestCart.items.find(item => item.productId === productId);

//       if (productInCart) {
//         productInCart.countinstock += 1;
//         productInCart.totalPrice += product.price;
//       } else {
//         guestCart.items.push({
//           productId: product._id.toString(),
//           price: product.price,
//           totalPrice: product.price,
//           countinstock: 1,
//         });
//       }

//       req.session.cart = guestCart;
//     }

//     res.redirect("/cart");
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).send('Internal server error');
//   }
// };

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


// const cart = async (req, res) => {
//   try {
//     let cartItems = [];

//     if (req.session.user) {
//       // User is logged in, fetch the cart from the database
//       const userId = req.session.user._id;
//       const userCart = await cartHelper.getCart(userId);

//       if (!userCart || userCart.items.length === 0) {
//         return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
//       }

//       cartItems = userCart.items;
//     } else {
//       // User is not logged in, fetch the cart from the session
//       const guestCart = req.session.cart || { items: [] };

//       if (guestCart.items.length === 0) {
//         return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
//       }

//       const productDetails = await cartHelper.getProductDetails(
//         guestCart.items.map(item => item.productId)
//       );

//       cartItems = guestCart.items.map(item => {
//         const product = productDetails.find(prod => prod._id.toString() === item.productId);
//         return {
//           productId: {
//             _id: product._id,
//             name: product.name,
//             price: product.price,
//             imageUrls: product.imageUrls,
//           },
//           countinstock: item.countinstock,
//           totalPrice: item.totalPrice,
//         };
//       });
//     }

//     res.render('user/cart', { products: cartItems });
//   } catch (error) {
//     console.error('Error fetching cart details:', error);
//     res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
//   }
// };

const cart = async (req, res) => {
  try {
    let cartItems = [];

    if (req.session.user) {
      const userCart = await cartHelper.getCart(req.session.user._id);

      if (!userCart || userCart.items.length === 0) {
        return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
      }

      cartItems = userCart.items;
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
    }

    res.render('user/cart', { products: cartItems });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
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
  logout,
};


// doubts
// const { error } = require("console");
