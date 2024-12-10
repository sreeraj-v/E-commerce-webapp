const Order = require("../models/order")
const {User} = require("../models/userSchema")
const Product = require("../models/productSchema");
const logger = require("../utils/logger");


module.exports = {
  // user side helper
  processReturn: async (orderId, productId, returnReason) => {
    try {
      const order = await Order.findById(orderId).populate("items.product");
      if (!order) {
        return { success: false, message: "Order not found." };
      }

      const productIndex = order.items.findIndex(item => item.product._id.toString() === productId);
      if (productIndex === -1) {
        return { success: false, message: "Product not found in this order." };
      }

      const refundAmount = order.items[productIndex].price * order.items[productIndex].quantity;
            
      order.items[productIndex].return = true; 
      order.items[productIndex].returnReason = returnReason; 
      order.items[productIndex].returnStatus = "Requested"; 
      order.items[productIndex].refundAmount = refundAmount;

      // Check if all products in the order are returned to mark completeOrderReturn
      if (order.items.every(item => item.return)) {
        order.completeOrderReturn = true;
      }

      await order.save();

      return { success: true, message: "Return request processed successfully" };
    } catch (error) {
      logger.error("Error in return processing:", error);
      return { success: false, message: "Error processing return." };
    }
  },

  // admin side helpers

  getOrdersWithReturns: async function () {
    try {
      return await Order.find({ "items.return": true }).populate('user', 'name').populate('items.product', 'name').lean();                                 
    } catch (error) {
      logger.error('Error fetching return orders:', error);
      throw error;
    }
  },

  updateReturnStatuses: async (returnId, newStatus) => {
    try {
      const order = await Order.findOne({ 'items._id': returnId }).populate('user');
      const item = order.items.find(item => item._id.toString() === returnId);
  
      if (!item) {
        throw new Error("Item not found");
      }
  
      // Update 4 return status in the order
      const result = await Order.updateOne(
        { 'items._id': returnId },
        { 
          $set: { 
            'items.$.returnStatus': newStatus, 
            'items.$.refund': newStatus === 'Approved', // Mark refund as true when approved
          } 
        }
      );
  
      // If  return status is "Approved", add refund amount to wallet and update stock
      if (newStatus === 'Approved') {
        const refundAmount = item.refundAmount;
        const productId = item.product;
        const quantity = item.quantity;
  
        // Add refund to the wallet
        await User.updateOne(
          { _id: order.user._id },
          { $inc: { wallet: refundAmount } }
        );
  
        // Increase the product stock
        await Product.updateOne(
          { _id: productId },
          { $inc: { stockAvailable: quantity } }
        );
      }
  
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error updating return status:', error);
      return false;
    }
  }
};

