const Order = require("../models/order")
const User = require('../models/userSchema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports={
  
   cancelOrders: async (orderId) => {
    try {
      // Find the order by orderId 
      const order = await Order.findOne({ _id: orderId });
  
      if (!order) {
        return { success: false, message: "Order not found", status: 404 };
      }
  
      // // Check if the order can be canceled (only if Processing or Shipped)
      // if (order.orderStatus !== 'Processing' && order.orderStatus !== 'Shipped') {
      //   return { success: false, message: "Order cannot be canceled", status: 400 };
      // }
  
      // Find the specific product in the order
      // const orderItem = order.items.find(item => item.product.toString() === productId);
  
      // Handle Stripe Payment Refund
      if (order.paymentType === 'Stripe Payment') {
        // const refundAmount = orderItem.price * orderItem.quantity;
  
        try {
          // Process refund with Stripe
          await stripe.refunds.create({
            payment_intent: order.stripeIntentId,
            amount: Math.round(order.finalAmount * 100), // Stripe works in cents
          });
  
          // Update the user's wallet with the refund amount
          const user = await User.findById(order.user);
          user.wallet += order.finalAmount;
          await user.save();
  
          // Mark the refund as successful in the order
          // orderItem.refund = true;
          // orderItem.refundAmount = refundAmount;
        } catch (error) {
          return { success: false, message: "Failed to process the refund", status: 500 };
        }
      }
  
      // Update the order status to Cancelled and save
      order.orderStatus = 'Cancelled';
      await order.save();
  
      return { success: true, message: "Order canceled successfully", status: 200 };
    } catch (error) {
      console.error('Cancel Order Helper Error:', error);
      return { success: false, message: "Internal Server Error", status: 500 };
    }
  }
  
}