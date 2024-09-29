const mongoose = require('mongoose');

const mainBanner =  mongoose.Schema(
  {
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  displayOrder: { type: Number, required: true }
}, 
{ timestamps: true }
);



const MainBanner = mongoose.model('Mainbanner', mainBanner);

module.exports = {MainBanner};
