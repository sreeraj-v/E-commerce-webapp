const {MainBanner,BrandBanner, MidBanner, BottomBanner} = require("../models/banner")

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
    const newBanner = new MidBanner ({
      title,
      subtitle,
      link,
      displayOrder,
      image
    })

    await newBanner.save()
  },

  findMidBanner: async ()=>{
    return await MidBanner.find().sort({displayOrder:1}).lean()
  },

  addBottomBanners: async (body,image)=>{
    const {title,subtitle,link,displayOrder} = body
    const newBanner = new BottomBanner({
      title,
      subtitle,
      link,
      displayOrder,
      image
    })
    await newBanner.save()
  },

  findBottomBanner: async()=>{
    return await BottomBanner.find().sort({displayOrder:1}).lean()
  }
}