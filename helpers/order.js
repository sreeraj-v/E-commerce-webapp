const Order = require("../models/order")

module.exports =  {
  createOrder: async (orderData) => {
    try {
      const newOrder = new Order(orderData);
      await newOrder.save();
      return newOrder;
    } catch (error) {
      console.error("Error creating order: ", error);
      throw error;
    }
  },

  findOrderByStripeIntentId: async (stripeIntentId) => {
    return await Order.findOne({ stripeIntentId }).populate('address').populate('items.product')
  },

  updateOrderStatus: async (orderId, updates) => {
    return await Order.findByIdAndUpdate(orderId, updates, { new: true });
  },

  findOrderByOrderId: async (orderId)=>{
    return await Order.findOne({orderId}).populate('address').populate('items.product')
  },

 findOrders: async ()=>{
  return await Order.find().populate('items.product').populate('address').lean()
 }
};