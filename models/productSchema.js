const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  image:[
    {
      type:String,
      required:false
    }
  ],
  brand:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true,
    trim:true
  },
  category:{
    type:String,
    required:true,
    enum:["premium","New arrival","popular","mens","womens"]
  },
  description:{
    type:String,
    default:"Step into comfort and style with our versatile and durable shoes, crafted for every occasion."
  },
  stockAvailable:{
    type:Number,
    default:10
  },
  isActive:{
    type:Boolean,
    default:true,
  }
},
{timestamps:true}
);

const Product = mongoose.model("Product",productSchema)

module.exports = Product