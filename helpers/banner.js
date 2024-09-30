const {MainBanner,BrandBanner} = require("../models/banner")

module.exports = {
  addMainBanners: async (body,image)=>{
    const { title, subtitle, description, link, displayOrder } = body;

    const newBanner = new MainBanner({
      title,
      subtitle,
      description,
      link,
      displayOrder,
      image
    }) 

    await newBanner.save()
  },

  findMainBanner: async ()=>{
    return await MainBanner.find().sort({ displayOrder: 1 }).lean()
  },

  addBrandBanners: async (displayOrder,image)=>{
    const newBanner = new BrandBanner({
      image,
      displayOrder
    })
    await newBanner.save()
  },

  findBrandBanner: async()=>{
    return await BrandBanner.find().sort({displayOrder:1}).lean()
  },

  addMidBanners: async(body,image)=>{
    const {title,subtitle,link,displayOrder} = body

  }
}