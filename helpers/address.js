const { Address } = require("../models/userSchema");

const addressHelper = {
  createAddress: async (userId, addressData) => {
    try {
      const newAddress = new Address({
        userId,
        ...addressData,
      });
      await newAddress.save();
      return newAddress;
    } catch (error) {
      console.error("Error creating address: ", error);
      throw error;
    }
  },

  getUserAddresses: async (userId) => {
    try {
      return await Address.find({ userId }).lean();
    } catch (error) {
      console.error("Error fetching addresses: ", error);
      throw error;
    }
  },
};

module.exports = addressHelper;
