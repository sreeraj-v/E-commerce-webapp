const Coupon = require("../models/coupon")

module.exports = {

  addNewCoupons: async (body) => {
    try {
      const { code, description, discount, minPriceRange, maxPriceRange, usageCount, expireDate } = body
      const newCoupon = new Coupon({
        code,
        description,
        discount,
        minPriceRange,
        maxPriceRange,
        usageCount,
        expireDate
      })
      await newCoupon.save()
    } catch (error) {
      console.error("Error on adding coupon :", error)
    }
  },

  getCoupon: async ()=>{
    return await Coupon.find({ expireDate: { $gte: new Date() } }).lean()
  },

  getOneCoupon: async (id)=>{
    return await Coupon.find({id}).lean()
  },

  validateCoupon: async (couponCode, cartTotal) => {
    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return { valid: false, message: "Coupon not found" };
        }

        if (coupon.expireDate < new Date()) {
            return { valid: false, message: "Coupon has expired" };
        }

        if (cartTotal < coupon.minPriceRange || cartTotal > coupon.maxPriceRange) {
            return { valid: false, message: `Coupon not valid for your cart total. Minimum: ${coupon.minPriceRange} needed` };
        }

        return { valid: true, discount: coupon.discount };
    } catch (error) {
        console.error("Error validating coupon:", error);
        throw error;
    }
  }
}