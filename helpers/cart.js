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


// const Cart = require("../models/cart");

// module.exports = {
//    addProductToCart : async (userId, product) => {
//     const cart = await Cart.findOne({ userId });
//     if (cart) {
//       const item = cart.items.find(item => item.productId.toString() === product._id.toString());
//       if (item) {
//         item.countinstock += 1;
//         item.totalPrice = item.price * item.countinstock;
//       } else {
//         cart.items.push({
//           productId: product._id,
//           price: product.price,
//           totalPrice: product.price,
//           countinstock: 1,
//         });
//       }
//       await cart.save();
//     } else {
//       await Cart.create({
//         userId,
//         items: [{
//           productId: product._id,
//           price: product.price,
//           totalPrice: product.price,
//           countinstock: 1,
//         }],
//       });
//     }
//   },
  
//    getCart : async (userId) => {
//     if (userId) {
//       return await Cart.findOne({ userId }).populate("items.productId").lean();
//     }
//     return null; // Return null for guests, as their cart is in the session
//   }
// };

const Cart = require("../models/cart");
const { updateProduct } = require("./product");

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
    console.log(productId);
    console.log(userId);
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
  }
};
