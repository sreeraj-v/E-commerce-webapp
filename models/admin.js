const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const adminSchema = mongoose.Schema({
  name: {
    type:String,
    minlength:[4, "name can't be smaller than 3 characters"],
    maxlength:[20, "Name can't be greater than 20 characters"],
    required:[true, "name is required"]
  },
  password: {
    type:String,
    required:true
  }
})

// password hashing
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// password comparing
adminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};


const Admin = mongoose.model("Admin",adminSchema)

module.exports=Admin;