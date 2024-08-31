// models/orderSchema.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
      price: { 
        type: Number, 
        required: true 
      }
    }
  ],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  finalAmount: { 
    type: Number, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  paymentIntentId: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  address: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  }
});

module.exports = mongoose.model('Order', orderSchema);
