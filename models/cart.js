const mongoose = require("mongoose")

const cartSchema = mongoose.Schema(
  {
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      index:true 
    },
    guestId:String,
    items:[
      {
        productId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Product"
        },
        price:{
          type:Number,
          required:true
        },
        quantity:{
          type:Number,
          required:true,
          default:1
        },
        total:{
          type:Number,
          required:true
        }
      }
    ]
  },
  {timestamps:true}
)

const Cart = mongoose.model("Cart",cartSchema);

module.exports = Cart;