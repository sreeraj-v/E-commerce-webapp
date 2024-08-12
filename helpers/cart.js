const Cart = require("../models/cart")

module.exports = {

  addProductToCart : async (product,userId,guestId)=>{
    const cart = await Cart.findOneAndUpdate(
      {userId:userId,guestId:guestId},
      {$push:{items:{productId:product._id,price:product.price,quantity:1,total:product.price}}},
      {new:true ,upsert:true}
    );
    return Cart.findOne({userId,guestId}).populate("items.productId").lean()
  },

  getCart: async(userId,guestId)=>{
    return await Cart.findOne({ userId: userId, guestId: guestId }).populate("items.productId").lean();
  }
}