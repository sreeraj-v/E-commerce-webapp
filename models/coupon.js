const mongoose=require('mongoose');


const couponSchema=mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    minPriceRange:{
        type:Number,
        required:true
    },
    maxPriceRange:{
        type:Number,
        required:true
    },
    usageCount:{
        type:Number
    },
    expireDate:{
        type:Date,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'amount'],
    }    
})

const Coupon =  mongoose.model('Coupon', couponSchema)

module.exports = Coupon;