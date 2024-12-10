const Coupon = require("../models/coupon")
const logger = require("../utils/logger");

module.exports = {

  addNewCoupons: async (body) => {
    try {
      const { code, description, discount, discountType, minPriceRange, maxPriceRange, usageCount, expireDate } = body
      const newCoupon = new Coupon({
        code,
        description,
        discount,
        discountType,
        minPriceRange,
        maxPriceRange,
        usageCount,
        expireDate
      })
      await newCoupon.save()
    } catch (error) {
      logger.error("Error on adding coupon :", error)
    }
  },

  updateCoupon: async (couponId,updatedData)=>{
    try{
    return await Coupon.findByIdAndUpdate(couponId,updatedData,{new:true})
    }catch(error){
      logger.error("Error on editng coupon :", error)  
      throw error;   
    }
  },

  removeCoupon: async (id)=>{
    return await Coupon.deleteOne({_id:id})
  },

  getCoupon: async ()=>{
    return await Coupon.find({ expireDate: { $gte: new Date() } }).lean()
  },

  validateCoupon: async (couponCode, cartTotal) => {
    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (cartTotal < coupon.minPriceRange || cartTotal > coupon.maxPriceRange) {
            return { valid: false, message: `Coupon not valid for your cart total. Minimum: ₹${coupon.minPriceRange} needed` };
        }

        return { valid: true, discount: coupon.discount, discountType: coupon.discountType };
    } catch (error) {
        logger.error("Error validating coupon:", error);
        throw error;
    }
  },

  getAllCoupons: async()=>{
    return await Coupon.find().lean()
  }
}