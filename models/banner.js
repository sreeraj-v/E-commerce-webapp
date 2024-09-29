const mongoose = require('mongoose');

const mainBannerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    displayOrder: { type: Number, required: true },
  },
  { timestamps: true }
);

const MainBanner = mongoose.model('MainBanner', mainBannerSchema);

module.exports = MainBanner;

