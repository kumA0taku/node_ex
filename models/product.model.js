const mongoose = require("mongoose");
const { Schema } = mongoose;

const productsSchema = new Schema({
  product_name: { type: String,required: true },
  price: { type: Number , required: true},
  amount: { type: Number , required: true},
});
module.exports = productsSchema;
