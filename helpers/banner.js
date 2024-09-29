const {MainBanner} = require("../models/banner")

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
    return await MainBanner.find()
  }
}