const Cart = require("../models/cart");

module.exports = {
  getCart: async function (userId) {
    return await Cart.findOne({ userId }).populate("items.productId").lean();
  },

  addProductToCart: async function (userId, product) {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const productInCart = cart.items.find(item => String(item.productId) === String(product._id));

      if (productInCart) {
        productInCart.quantity += 1;
        productInCart.total = productInCart.price * productInCart.quantity;
      } else {
        cart.items.push({
          productId: product._id,
          price: product.price,
          quantity: 1,
          total: product.price,
        });
      }

      await cart.save();
    } else {
      const newCart = new Cart({
        userId,
        items: [{
          productId: product._id,
          price: product.price,
          quantity: 1,
          total: product.price,
        }]
      });

      await newCart.save();
    }
  },

  addToGuestCart: function (sessionCart, product) {
    const productInCart = sessionCart.items.find(item => String(item.productId) === String(product._id));

    if (productInCart) {
      productInCart.quantity += 1;
      productInCart.total = productInCart.price * productInCart.quantity;
    } else {
      sessionCart.items.push({
        productId: product._id.toString(),
        price: product.price,
        quantity: 1,
        total: product.price,
      });
    }

    return sessionCart;
  },

  removeProduct : async(productId,userId)=>{
    await Cart.updateOne(
      {userId},
      {$pull:{items:{productId}}}
    )
  },

  updateProductQuantity: async(userId,productId,quantity,price)=>{
   return await Cart.updateOne(
      { userId: userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity, "items.$.total": quantity * price } }
  );
  },
  
  deleteCart: async (userId) => {
    return await Cart.deleteOne({ userId });
  }
};
