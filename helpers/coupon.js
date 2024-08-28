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
    return await Coupon.find().lean()
  },

  getOneCoupon: async (id)=>{
    return await Coupon.find({id}).lean()
  }
}