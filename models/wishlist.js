const mongoose = require('mongoose');


const wishlistSchema = mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  products:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  }]
})


const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
