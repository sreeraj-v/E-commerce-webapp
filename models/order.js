const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
      },
    },
  ],
  orderId: {
    type: String,
  },
  datePlaced: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
  },
  stripeIntentId: {
    type: String,
  },
  stockUpdated: {
    type: Boolean,
    default: false,
  },
  refund: {
    type: Boolean,
    default: false,
  },
  deliveryExpectedDate: {
    type: Date,
  },
  completeOrderReturn: {
    type: Boolean,
    default: false,
  },
  return: {
    type: String,
    default: false,
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;