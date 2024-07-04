const mongoose = require("mongoose");
const { Schema } = mongoose;

const ordersSchema = new Schema(
  {
    pizza_name: { type: String },
    qty: { type: Number },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('orders', ordersSchema)

