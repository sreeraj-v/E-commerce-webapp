// const Cart = require("../models/cart")

// module.exports = {

//   addProductToCart : async (product,userId,guestId)=>{
//     const cart = await Cart.findOneAndUpdate(
//       {userId:userId,guestId:guestId},
//       {$push:{items:{productId:product._id,price:product.price,quantity:1,total:product.price}}},
//       {new:true ,upsert:true}
//     );
//     return Cart.findOne({userId,guestId}).populate("items.productId").lean()
//   },

//   getCart: async (userId, guestId) => {
//     try {
//       const cart = await Cart.findOne({ userId: userId, guestId: guestId })
//         .populate({
//           path: 'items.productId',
//           model: 'Product' // Assuming 'Product' is your product model
//         })
//         .lean();
//       return cart;
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//       throw error; // Re-throw to handle the error appropriately
//     }
//   },
// }


const Cart = require("../models/cart");

module.exports = {
  getCart: async (userId) => {
    if (userId) {
      return await Cart.findOne({ userId }).populate("items.productId").lean();
    }
    return null;
  },

  addProductToCart: async (userId, product) => {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          items: { 
            productId: product._id, 
            price: product.price, 
            quantity: 1, 
            total: product.price 
          } 
        } 
      },
      { new: true, upsert: true }
    );
    return cart;
  },
  
};
