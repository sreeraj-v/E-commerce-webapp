const nodemailer = require("nodemailer");
const crypto = require("crypto")
const transporter = require("../config/nodemailer/emailer");
const productHelper = require("../helpers/product")
const cartHelper = require("../helpers/cart")
const addressHelper = require("../helpers/address")
const couponHelper = require("../helpers/coupon")
const orderHelper = require("../helpers/order")
const returnHelper = require("../helpers/return");
const { User } = require("../models/userSchema");
const cancelHelper = require("../helpers/cancel");
const wishlistHelper = require('../helpers/wishlist');
const bannerHelper = require("../helpers/banner")


const Stripe = require("stripe")
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const { v4: uuidv4 } = require('uuid')
const PDFDocument = require('pdfkit');

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
    
    const user = await User.findOne({ email: email, isVerified: true });
    if (!user) {
      console.log("wrong email or isVerified false ");
      return res.render("user/login", { errorMsg: "invalid Email" });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      req.session.user = user;
      req.session.loggedIn = true;
      req.session.username = user.name;
      if (req.session.user) {
        console.log(user.name + " : login successfully");
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


// forget password post route for sending email with link

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ errorMsg: "No account with that email found." });
    }

    // Generate reset token and token expiry time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    user.verifyToken = resetToken;
    user.tokenExpiry = tokenExpiry;
    await user.save();

    // Send reset email
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ errorMsg: "Error sending reset email." });
      }
      console.log('Email sent: ' + info.response);

      return res.status(200).json({ successMsg: "Password reset email sent successfully." });
    });

  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ errorMsg: "An internal error occurred. Please try again later." });
  }
}

// reset password get 

const resetPassword = async (req,res)=>{
  try{
  const token = req.query.token
  if(!token){
    res.redirect("/login")
  }
  res.render("user/resetPassword",{token});
  }catch(error){
    console.error("Error in getting resetPassword page:", error);
  }
}

// submit reset Password

const submitResetPassword = async(req,res)=>{
  try {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.render("user/resetPassword", { errorMsg: "All fields are required" });
    }
    
    if (password !== confirmPassword) {
      return res.render("user/resetPassword", { errorMsg: "Passwords do not match" });
    }

    const user = await User.findOne({ verifyToken: token, tokenExpiry: { $gt: Date.now() } });
    
    if (!user) {
      return res.render("user/resetPassword", { errorMsg: "Invalid or expired token" });
    }

    user.password = password; 
    user.verifyToken = undefined;
    user.tokenExpiry = undefined;
    
    await user.save();
    
    return res.redirect("/login");
    
  } catch (error) {
    console.log("Error in resetPassword:", error);
    res.render("user/reset-password", { errorMsg: "An error occurred." });
  }

}


// home page getting route

const home = async (req, res) => {
  const user = req.session.user? true:false  
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

    const mainBanners = await bannerHelper.findMainBanner() 
    const brandBanners = await bannerHelper.findBrandBanner() 
    const midBanners = await bannerHelper.findMidBanner() 
    const bottomBanners = await bannerHelper.findBottomBanner() 

    res.render("user/index", { products: IsProductInCart,user,mainBanners,brandBanners,midBanners,bottomBanners });
  } catch (error) {
    console.log(error);
  }
};

const productView = async (req, res) => {
  const user = req.session.user? true:false  
  const productId = req.query.q
  console.log("prodctView area id", productId)
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
       cart = cart ? cart : { items: [] }; 
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
    res.render("user/productView", { product, isInCart,relatedProducts:isRelatedProductsInCart,user });
  } catch (error) {
    console.log(error);
    res.redirect("/500error");
  }
};



// const shop = async (req,res) =>{
//   const userId = req.session.user ? req.session.user._id : null
//   try{
//     const products = await productHelper.shopProducts()
    
//     let cart = {items : []}
//     if(userId){
//       cart = await cartHelper.getCart(userId)
//     }else if (req.session.cart){
//       cart = req.session.cart
//     }

//     const IsProductInCart = products.map(product => (
//       {...product,isInCart:cart.items.some(item => String(item.productId._id || item.productId) === String(product._id))}
//   ))

//     res.render("user/shop",{products:IsProductInCart})
//   }catch(error){
//     console.log(error)
//   }
// }

const shop = async (req, res) => {
  const user = req.session.user? true:false  
  const userId = req.session.user ? req.session.user._id : null;

  try {
    const products = await productHelper.shopProducts();

    let cart = { items: [] };

    if (userId) {
      cart = await cartHelper.getCart(userId);

      if (!cart) {
        cart = { items: [] };
      } else if (!cart.items) {
        cart.items = [];
      }
    } else if (req.session.cart) {
      cart = req.session.cart;

      if (!cart.items) {
        cart.items = [];
      }
    }

    const IsProductInCart = products.map((product) => ({
      ...product,
      isInCart: cart.items.some((item) => String(item.productId._id || item.productId) === String(product._id)),
    }));

    res.render("user/shop", { products: IsProductInCart,user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};


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

const checkOut = async (req,res)=>{
  try{
    const user = req.session.user
    const userId =user._id
    const addresses = await addressHelper.getUserAddresses(userId)
    const coupons = await couponHelper.getCoupon()
    const userCart = await cartHelper.getCart(userId)
    let totalCartValue = 0;
    
    if(userCart&&userCart.items.length>0){
      totalCartValue = userCart.items.reduce((total, item) => total + item.total, 0).toFixed(2);

      res.render("user/checkout",{user ,addresses,coupons,totalCartValue,userCart})
    }else{
      res.redirect("/")
    }
  }catch(error){
    console.error("Error fetching address : ",error)
    res.status(500).send("internal server error")
  }
}

const addNewAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressData = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      streetAddress: req.body.streetAddress.trim(),
      city: req.body.city.trim(),
      country: req.body.country.trim(),
      pincode: req.body.pincode.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email.trim()
    };

    await addressHelper.createAddress(userId, addressData);
    res.status(200).json({ success: true, message: "Address added successfully!" });
  } catch (error) {
    console.error("Erron adding address :-", error);
    res.status(500).json({ error: "Error adding address" });  
}
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, cartTotal } = req.body;
    const result = await couponHelper.validateCoupon(couponCode, cartTotal);

    if (result.valid) {
      let newTotal;
      let discount;

      if (result.discountType === "percentage") {
        newTotal = cartTotal - cartTotal * (result.discount / 100);
         discount = cartTotal-newTotal
      } else if (result.discountType === "amount") {
        newTotal = cartTotal - result.discount;
         discount = cartTotal-newTotal
      }

      newTotal = Math.max(newTotal, 0);

      res.json({ success: true, newTotal,discount });
    } else {
      res.json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//  checkOut payment section >>>>>>>>>>>>>>>>>

// POST route to create order and handle payments
async function processOrder(req, res) {
  try {
    const { addressId, paymentType, totalCheckOutValue } = req.body;
    const userId = req.session.user._id;

    const cart = await cartHelper.getCart(userId);
    if (!cart) {
      return res.status(400).json({ error: 'Invalid cart.' });
    }

    const address = await addressHelper.getAddressById(addressId);
    if (!address) {
      return res.status(400).json({ error: 'Invalid address.' });
    }

    const totalAmount = cart.items.reduce((total, item) => total + item.total, 0);
    const finalAmount = totalCheckOutValue || totalAmount;
    const discount = totalAmount - finalAmount;

    let session;
    let order;

     // Handle different payment methods
    if (paymentType === 'Wallet Payment') {
      const user = await User.findOne(userId);  // Assuming there's a method to find a user by ID
      if (user.wallet < finalAmount) {
        return res.status(400).json({ error: 'Insufficient wallet balance for this order.' });
      }

      // Deduct wallet balance
      user.wallet -= finalAmount;
      await user.save();
    }


    order = await orderHelper.createOrder({
      user: userId,
      address: address._id,
      items: cart.items.map(item => ({
        product: item.productId._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      discount,
      finalAmount,
      paymentType,
      stripeIntentId: paymentType === 'Stripe Payment' ? null : undefined, 
      orderId: `Order-${uuidv4()}`, 
      deliveryExpectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  
    });

    // if (paymentType === 'Stripe Payment') {
    //   // Create Stripe session for payment
    //   session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     mode: 'payment',
    //     line_items: cart.items.map(item => ({
    //       price_data: {
    //         currency: 'inr',
    //         product_data: { name: item.productId.name },
    //         unit_amount: item.price * 100,
    //       },
    //       quantity: item.quantity,
    //     })),
    //     success_url: `${req.protocol}://${req.get('host')}/orderSuccess?session_id={CHECKOUT_SESSION_ID}`,
    //     cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
    //     metadata: {
    //       orderId: order._id.toString(),
    //       userId: userId.toString(),
    //       addressId: address._id.toString(),
    //     },
    //   });

    //   order.stripeIntentId = session.id;
    //   await order.save();
    // }

    if (paymentType === 'Stripe Payment') {
      // Create Stripe session for payment, considering the discount amount
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'inr',
            product_data: { name: 'Order Total' },  // Simplifying to show the total price
            unit_amount: finalAmount * 100,  // Stripe expects the amount in the smallest currency unit (e.g., paise for INR)
          },
          quantity: 1,
        }],
        success_url: `${req.protocol}://${req.get('host')}/orderSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
        metadata: {
          orderId: order._id.toString(),
          userId: userId.toString(),
          addressId: address._id.toString(),
        },
      });
    
      order.stripeIntentId = session.id;
      await order.save();
    }
    

    await cartHelper.deleteCart(userId);

    const orderedProducts = await orderHelper.findOrderByOrderId(order.orderId)

    const mailOptions = {
      from:process.env.EMAIL_USER,
      to:req.session.user.email,
      subject: 'Order Confirmation',
      html: `
        <h3>Order Confirmation</h3>
        <p>Thank you for your purchase!</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
        <p><strong>Discount:</strong> ${order.discount}</p>
        <p><strong>final Amount:</strong> ${order.finalAmount}</p>
        <p><strong>Delivery Address:</strong> ${address.streetAddress}, ${address.city}, ${address.country}</p>
        <p><strong>Expected Delivery Date:</strong> ${order.deliveryExpectedDate.toDateString()}</p>
        <p><strong>Order Summary:</strong></p>
        <ul>
          ${orderedProducts.items.map(item => `<li>${item.product.name} (Qty: ${item.quantity}) - ${item.price}</li>`).join('')}
        </ul>
      `
    }

    transporter.sendMail(mailOptions,(error,info)=>{
      if(error){
        console.error('Error sending email:', error);
      }else{
        console.log('Email send:'+ info.response);
      }
    })

    // if (paymentType === 'Stripe Payment') {
    //   return res.status(200).json({ url: session.url });
    // } else {
    //   // COD Payment success
    //   return res.status(200).json({ message: 'Order placed successfully with Cash on Delivery', orderId: order.orderId });
    // }
    if (paymentType === 'Stripe Payment') {
      return res.status(200).json({ url: session.url });
    } else if (paymentType === 'Wallet Payment') {
      return res.status(200).json({ message: 'Order placed successfully with Wallet Payment', orderId: order.orderId });
    } else {
      return res.status(200).json({ message: 'Order placed successfully with Cash on Delivery', orderId: order.orderId });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'An error occurred while creating your order.' });
  }
}

// GET route for order confirmation and showing orderSuccess page
async function confirmOrderPayment(req, res) {
  try {
    const { session_id } = req.query;
    const { orderId } = req.query;
    let order;

    if (session_id) {
      // Handle Stripe payment
      const session = await stripe.checkout.sessions.retrieve(session_id);
      order = await orderHelper.findOrderByStripeIntentId(session.id);

      if (!order) {
        return res.status(400).json({ error: 'Order not found.' });
      }

      const paymentIntentId = session.payment_intent;  // <--- Retrieve Payment Intent ID

      // If payment is successful
      if (session.payment_status === 'paid') {
        order.orderStatus = 'Processing';
        order.paymentIntentId = paymentIntentId;  // <--- Save Payment Intent ID (new)

        // Update stock if not already updated
        if (!order.stockUpdated) {
          await updateStockForOrder(order);
          order.stockUpdated = true;
        }
      } else {
        order.orderStatus = 'Cancelled';
      }

      await order.save();
    } else if (orderId) {
      // Handle Cash on Delivery (COD) &wallet
      order = await orderHelper.findOrderByOrderId(orderId);

      // Ensure stock is updated for COD orders
      if (!order.stockUpdated) {
        await updateStockForOrder(order);
        order.stockUpdated = true;
        order.orderStatus = 'Processing';  
        await order.save();
      }
    }

    order = order.toObject()
    console.log('confirm orderpage area:',order)
    // if no orderId/stripe sessionId available redirect to home for only showing orderSucces page one time only
    if (!order) {
      return res.redirect('/');
    }

    return res.render('user/orderSuccess', { order });
  } catch (error) {
    console.error('Error confirming order payment:', error);
    return res.status(500).json({ error: 'An error occurred while confirming your order.' });
  }
}

// above Helper function to update stock for every order
async function updateStockForOrder(order) {
  for (const item of order.items) {
    const product = await productHelper.getProductById(item.product);

    if (product.stockAvailable >= item.quantity) {
      product.stockAvailable -= item.quantity;
      await product.save();
    } else {
      throw new Error(`Not enough stock available for product ${product.name}`);
    }
  }
}

// ordersuccess page invoice download >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

async function downloadInvoice(req, res) {
  try {
    const { orderId } = req.params;

    const order = await orderHelper.findOrderByOrderId(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Set the response to download the PDF
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    // Create a new PDF document with margins
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the document to the response
    doc.pipe(res);

    // Add a single box for the entire invoice
    doc.rect(50, 50, 500, 700).stroke();

    doc.moveDown(1.5).fontSize(20).text('Order Invoice', { align: 'center', underline: true }).moveDown(1.5);

    // Order details 
    doc.fontSize(16).text('Order Details:', { underline: true }).moveDown(0.5);
    doc.fontSize(14).text(`Order ID: ${order.orderId}`, 60, doc.y)
       .text(`Date Placed: ${order.datePlaced}`).moveDown(0.5)
       .text(`Delivery Date: ${order.deliveryExpectedDate}`).moveDown(1.5);

    // Delivery address 
    doc.fontSize(16).text('Delivery Address:', { underline: true }).moveDown(0.5)
       .fontSize(14).text(`${order.address.firstName} ${order.address.lastName}`, 60, doc.y)
       .text(`${order.address.streetAddress}, ${order.address.city}`, 60, doc.y)
       .text(`${order.address.country}, ${order.address.pincode}`, 60, doc.y)
       .text(`Email: ${order.address.email}`, 60, doc.y)
       .text(`Phone: ${order.address.phone}`, 60, doc.y).moveDown(1.5);

    // Order summary 
    doc.fontSize(16).text('Order Summary:', { underline: true }).moveDown(0.5);

    order.items.forEach((item, index) => {
      doc.fontSize(14).text(`${index + 1}. ${item.product.name} (Qty: ${item.quantity}) - ${item.price}`, 60, doc.y);
    });

    doc.moveDown(1.5);

    // Payment details  
    doc.fontSize(14).text(`Sub Total: ${order.finalAmount}`, 60, doc.y)
       .text('Delivery: 00.00', 60, doc.y)
       .text(`Total: ${order.finalAmount}`, 60, doc.y);

    // End the document
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'An error occurred while generating the invoice.' });
  }
}

// myaccount get    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

async function myaccount(req,res){
  try{
    const userId = req.session.user._id
    
    const user = await User.findOne(userId).lean()
    const address = await addressHelper.getUserAddresses(userId)
    const orders = await orderHelper.getOrder(userId)
    res.render("user/myaccount",{orders,address,user})
  }catch(error){
    console.error('Error creating order:', error)
  }
}

//  order single product return >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

async function returnProduct(req, res) {
  try {
    const { orderId, productId, returnReason } = req.body;

    const returnResult = await returnHelper.processReturn(orderId, productId, returnReason);

    if (returnResult.success) {
      return res.status(200).json({ message: returnResult.message });
    } else {
      return res.status(400).json({ message: returnResult.message });
    }
  } catch (error) {
    console.error("Error processing return:", error);
    return res.status(500).json({ message: "Server error, please try again later." });
  }
}

//  order cancel >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const result = await cancelHelper.cancelOrders(orderId);
    
    if (!result.success) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// wishlist getting &adding    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const addToWishlist = async (req, res) => {
  try {
      const userId = req.session.user._id;
      const { productId } = req.body;

      const result = await wishlistHelper.addProductToWishlist(userId, productId);

      if (result) {
          return res.status(200).json({ success: true, message: 'Product added to wishlist.' });
      } else {
          return res.status(400).json({ success: false, message: 'Product already in wishlist.' });
      }
  } catch (error) {
      console.error('Error adding to wishlist:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

const getWishlist = async (req,res)=>{
  const user = req.session.user._id;
  try{
  const userWishlist = await wishlistHelper.findWishlist(user)

  let cart = { items: [] };

  if (user) {
    cart = await cartHelper.getCart(user);

    if (!cart) {
      cart = { items: [] };
    } else if (!cart.items) {
      cart.items = [];
    }
  } else if (req.session.cart) {
    cart = req.session.cart;

    if (!cart.items) {
      cart.items = [];
    }
  }

  const IsProductInCart = userWishlist.products.map((product) => ({
    ...product,
    isInCart: cart.items.some((item) => String(item.productId._id || item.productId) === String(product._id)),
  }));

  res.render("user/wishlist",{userWishlists:IsProductInCart})
  }catch(error){
    console.error('Error rendering in wishlist:', error);
    return res.status(500).send('Server error. Please try again.');    
  }
}

async function removeFromWishlist(req,res){
  try{
  const user = req.session.user._id
  const productId = req.query.q
  
  await wishlistHelper.removeWishlist(user,productId)
  res.redirect("/wishlist")
  }catch(error){
    console.error('Error removing in wishlist:', error);
  }
}
// logout    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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
  applyCoupon,
  processOrder,
  confirmOrderPayment,
  downloadInvoice,
  logout,
  myaccount,
  returnProduct,
  cancelOrder,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  forgotPassword,
  resetPassword,
  submitResetPassword
};


// doubts
// const { error } = require("console");


