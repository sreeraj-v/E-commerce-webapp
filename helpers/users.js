const {User} = require("../models/userSchema")

module.exports = {

  findUsers: async()=>{
    const users = await User.find().lean()
    return users;
  },

  toggleStatus: async(userId,isBlocked)=>{
    const user = await User.findByIdAndUpdate(userId, { isBlocked: isBlocked }, { new: true }).lean();
    return user;
  },

  searchAndFilter: async(searchCriteria) => {
    const user = await User.find(searchCriteria).lean()
    return user;
  },

  removeUser: async(id) => {
    const user = await User.findByIdAndUpdate(id,{isDeleted:true},{new:true}).lean();
    return user;
  }
}