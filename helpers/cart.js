const Cart = require("../models/cart")
const Product = require("../models/productSchema")

module.exports = {

  addProductToCart : async (userId,guestId,productId)=>{
    const product = Product.findById(productId)
    const cart = await Cart.findOneAndUpdate(
      {userId:userId,guestId:guestId,"items.productId":product._id},
      {$inc:{"items.$.quantity":1,"items.$.total":product.price}},
    )
  }
}