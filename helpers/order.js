const Order = require("../models/order")
// const Product = require("../models/productSchema")

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

filterOrdersHelper: async (filter) => {
  const orders = await Order.find(filter).populate("items.product address user")
  return orders;
},

getOrder: async (user)=>{
  return await Order.find({user}).populate("items.product address user").sort({datePlaced:-1}).lean()
},

 processReturnRequest: async (orderId, productId, userId) =>{
  // Find the order by orderId and userId
  const order = await Order.findOne({ _id: orderId, user: userId });
  console.log(order)

  if (order) {
      // Mark the specific product as returned
      const item = order.items.find(item => item.product.toString() === productId);
  console.log(item)
      
      if (item) {
          order.return = true;
          await order.save();
          return order;
      }
  }

  return null;
}

};