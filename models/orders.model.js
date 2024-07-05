const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types; // Import ObjectId

const ordersSchema = new Schema(
  {
    pizza_id: { type: ObjectId},
    pizza_name: { type: String },
    qty: { type: Number },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('orders', ordersSchema)

