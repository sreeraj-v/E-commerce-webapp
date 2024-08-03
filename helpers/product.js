const Product = require ("../models/productSchema");

module.exports={

  viewProduct: async function(){
    const products = await Product.find().lean()
    return products;
  },

  viewSingleProduct: async (productId)=>{
    const product = await Product.findById(productId).lean()
    return product;
  },

  relatedProduct: async(category)=>{
    const relatedProducts = await Product.find({category}).lean()
    return relatedProducts;
  },

  addProducts: async function(body,images){
    const { name, brand, price, category, description, stockAvailable } = body;
    const newProduct = new Product({
      name,
      brand,
      price,
      category,
      description,
      stockAvailable,
      image: images
    })
    await newProduct.save();

    console.log("product added successfully");
    return newProduct;
  },

  activateProduct:async function(productId){
    const product = await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true }).lean()
    return product;
  },

  inactivateProduct: async function(productId){
    const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true }).lean();
    return product;
  },

  getEditPage: async function(productId){
    const product = await Product.findById(productId).lean()
    return product;
  },

  updateProduct: async function(productId,image,body){
    const { name, brand, price, category, description, stockAvailable } = body;
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        image,
        brand,
        price,
        category,
        description,
        stockAvailable
      },
      { new: true }
    )
    return product;
  },
  
  searchProduct: async(searchCriteria)=>{
    const product = await Product.find(searchCriteria).lean()
    return product;
  }
}