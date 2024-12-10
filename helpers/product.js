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
    const relatedProducts = await Product.find({isActive:true,category}).limit(10).lean()
    return relatedProducts;
  },

  shopProducts: async(filterCriteria = {})=>{
    const products = await Product.find({ isActive: true, ...filterCriteria }).lean();
    return products;
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

  getProductById: async function(productId){
    const product = await Product.findById(productId)
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
  },

  getProductDetails : async (productIds) => {
    return await Product.find({ _id: { $in: productIds } }).lean();
  }
}