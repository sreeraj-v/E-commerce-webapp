const Order = require("../models/order")

// module.exports = {
//   processReturn: async (orderId, productId, returnReason) =>{
//     try {
//       const order = await Order.findById(orderId).populate("items.product");
//       console.log(order);
      
  
//       if (!order) {
//         return { success: false, message: "Order not found." };
//       }
  
//       const productIndex = order.items.findIndex(item => item.product._id.toString() === productId);
  
//       if (productIndex === -1) {
//         return { success: false, message: "Product not found in this order." };
//       }
  
//       // Update the product return status in the order
//       order.items[productIndex].return = returnReason;
  
//       // Mark the whole order as return if all products are returned
//       if (order.items.every(item => item.return)) {
//         order.completeOrderReturn = true;
//       }
  
//       await order.save();
  
//       return { success: true };
//     } catch (error) {
//       console.error("Error in return processing:", error);
//       return { success: false, message: "Error processing return." };
//     }
//   }
// }

module.exports = {
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

      // Calculate the refund amount based on price * quantity
      const refundAmount = order.items[productIndex].price * order.items[productIndex].quantity;
      
      // Update the product return status in the order
      order.items[productIndex].return = true; // Mark the product as returned
      order.items[productIndex].returnReason = returnReason; // Store the return reason
      order.items[productIndex].returnStatus = "Requested"; // Set the return status
      order.items[productIndex].refundAmount = refundAmount; // Store the refund amount

      // Check if all products in the order are returned to mark completeOrderReturn
      if (order.items.every(item => item.return)) {
        order.completeOrderReturn = true;
      }

      await order.save();

      return { success: true, refundAmount };  // Returning refundAmount for possible use
    } catch (error) {
      console.error("Error in return processing:", error);
      return { success: false, message: "Error processing return." };
    }
  },

  getOrdersWithReturns: async function () {
    try {
      return await Order.find({ "items.return": true }).populate('user', 'name').populate('items.product', 'name').lean();                                 
    } catch (error) {
      console.error('Error fetching return orders:', error);
      throw error;
    }
  }
};

