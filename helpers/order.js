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
  return await Order.find().populate('items.product').populate('address').lean().sort({datePlaced:-1})
 },

 getFilteredOrders: async (filters) => {
  const { search, status, payment } = filters;
  const query = {};

  if (search) {
    query.$or = [
      { orderId: { $regex: search, $options: 'i' } },   // Search by Order ID
      { finalAmount: search },                          // Search by final amount
      { 'items.product.name': { $regex: search, $options: 'i' } } // Product Name search
    ];
  }

  if (status) {
    query.orderStatus = status;
  }

  if (payment) {
    query.paymentType = payment;
  }

  return Order.find(query).populate('items.product').populate('address');
 }

};