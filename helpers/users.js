const Users = require("../models/userSchema")

module.exports = {

  findUsers: async()=>{
    const users = await Users.find().lean()
    return users;
  },

  toggleStatus: async(userId,isBlocked)=>{
    const user = await Users.findByIdAndUpdate(userId, { isBlocked: isBlocked }, { new: true }).lean();
    return user;
  },

  searchAndFilter: async(searchCriteria) => {
    const user = await Users.find(searchCriteria).lean()
    return user;
  },

  removeUser: async(id) => {
    const user = await Users.findByIdAndUpdate(id,{isDeleted:true},{new:true}).lean();
    return user;
  }
}