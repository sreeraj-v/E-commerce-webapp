const Admin = require("../models/admin")

module.exports = {

  findAdmin: async(name) =>{
    const admin = await Admin.findOne({name})
    return admin
  }
}