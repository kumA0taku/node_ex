const mongoose = require("mongoose");
const { Schema } = mongoose;

const pizzaSchema = new Schema(
  {
    menu: { type: String, unique: true },
    price: { type: Number },
    stoke: { type: Number },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('pizzas', pizzaSchema)

