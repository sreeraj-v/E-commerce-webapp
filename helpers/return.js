const Order = require("../models/order")

module.exports = {
  processReturn: async (orderId, productId, returnReason) =>{
    try {
      const order = await Order.findById(orderId).populate("items.product");
  
      if (!order) {
        return { success: false, message: "Order not found." };
      }
  
      const productIndex = order.items.findIndex(item => item.product._id.toString() === productId);
  
      if (productIndex === -1) {
        return { success: false, message: "Product not found in this order." };
      }
  
      // Update the product return status in the order
      order.items[productIndex].return = returnReason;
  
      // Mark the whole order as return if all products are returned
      if (order.items.every(item => item.return)) {
        order.completeOrderReturn = true;
      }
  
      await order.save();
  
      return { success: true };
    } catch (error) {
      console.error("Error in return processing:", error);
      return { success: false, message: "Error processing return." };
    }
  }
}