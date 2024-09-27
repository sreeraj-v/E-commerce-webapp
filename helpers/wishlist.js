const Wishlist = require('../models/wishlist');

module.exports = {
  addProductToWishlist: async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist) {
      // Check if product already in wishlist
      if (wishlist.products.includes(productId)) {
        return false; // Product already in wishlist
      }

      wishlist.products.push(productId);
      await wishlist.save();
      return true;
    } else {
      // Create a new wishlist for the user
      const newWishlist = new Wishlist({
        user: userId,
        products: [productId],
      });
      await newWishlist.save();
      return true;
    }
  },

  findWishlist: async (user) => {
    return await Wishlist.findOne({ user }).populate("products").lean();
  },

  removeWishlist: async (user, id) => {
    await Wishlist.updateOne({ user }, { $pull: { products: id } });
  },
};