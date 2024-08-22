const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// const addressSchema = mongoose.Schema(
//   {

//   }
// )

const addressSchema = mongoose.Schema({
  user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Users'
  },
  firstName: {
      type: String,
      required: true
  },
  lastName: {
      type: String,
  },
  email: {
      type: String,
      required: true
  },
  telephone:{
      type:String,
      required:true
  },
  company:{
      type:String
  },
  street:{
      type:String
  },
  address:{
      type:String,
      required:true
  },
  apartment:{
      type:String,
      required:true
  },
  city:{
      type:String,
      required:true
  },
  postCode:{
      type:String,
      required:true
  },
  state:{
      type:String,
      required:true
  },
  notes:{
      type:String
  }

})



const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [4, "name can't be smaller than 3 characters"],
      maxlength: [20, "Name can't be greater than 20 characters"],
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      minlength: [7, "Email is short "],
      maxlength: [100, "Email can't be greater than 100 characters"],
      required: [true, "Email is Required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [4, "Password should be greater than 4 characters"],
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      maxlength: [10, "invalid phone number"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    isDeleted: {
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

// password hashing

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// password comparing

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
