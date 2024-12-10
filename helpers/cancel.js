const Order = require("../models/order")
const {User} = require('../models/userSchema');
const Product = require('../models/productSchema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");


module.exports={
  
   cancelOrders: async (orderId) => {
    try {
      const order = await Order.findOne({ _id: orderId });
  
      if (!order) {
        return { success: false, message: "Order not found", status: 404 };
      }
  
      if (order.paymentType === 'Stripe Payment') {
        try {
          await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(order.finalAmount * 100), // Stripe works in cents
          });
  
          // Update the user's wallet with the refund amount
          const user = await User.findById(order.user);
          user.wallet += order.finalAmount;
          await user.save();
        } catch (error) {
          logger.error('Stripe Error:', error);
          return { success: false, message: "Failed to process the refund", status: 500 };
        }
      }
  
      // Increment stock for each product in the order
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stockAvailable += item.quantity; // Increment stock by ordered quantity
          await product.save(); 
        }
      }
  
      order.orderStatus = 'Cancelled';
      order.completeOrderReturn = true; 
      await order.save();
  
      return { success: true, message: "Order canceled successfully", status: 200 };
    } catch (error) {
      logger.error('Cancel Order Helper Error:', error);
      return { success: false, message: "Internal Server Error", status: 500 };
    }
  },
  
  getCancelledOrders: async()=>{
    return await Order.find({completeOrderReturn:true}).populate('user', 'name').populate('items.product', 'name').lean();                                 
  }
}