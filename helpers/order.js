const Order = require("../models/order")
const Product = require("../models/productSchema")

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

 searchAndFilterOrders: async (searchQuery, statusFilter, paymentFilter) => {
  const searchCriteria = {};

  // If search query is provided, search by orderId or product name
  if (searchQuery) {
    searchCriteria.$or = [
      { orderId: { $regex: searchQuery, $options: 'i' } },
      { 'items.product.name': { $regex: searchQuery, $options: 'i' } },
    ];
  }

  // Apply status filter if provided
  if (statusFilter) {
    searchCriteria.orderStatus = statusFilter;
  }

  // Apply payment filter if provided
  if (paymentFilter) {
    searchCriteria.paymentType = paymentFilter;
  }

  try {
    return await Order.find(searchCriteria)
      .populate('user')
      .populate('items.product')
      .populate('address');
  } catch (error) {
    throw new Error('Error searching/filtering orders: ' + error.message);
  }
}

};