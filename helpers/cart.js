const Cart = require("../models/cart")

module.exports = {

  addProductToCart : async (userId,guestId,product)=>{
    const cart = await Cart.findOneAndUpdate(
      {userId:userId,guestId:guestId,"items.productId":product._id},
      {$inc:{}}    )
  }
}