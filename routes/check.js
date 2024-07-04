var express = require("express");
var router = express.Router();
var multer = require("multer")
var userSchema = require("../models/user.model");
// var productsSchem = require("../models/product.model");
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.')[1])
  }
})
const upload = multer({ storage: storage })


/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    // let hash = await bcrypt.hash("1234",10);
    // let compare = await bcrypt.compare("1234", hash)
    let token = await jwt.sign({ foo: 'bar'}, '1234', {expiresIn: "1h"})
    let users = await userSchema.find({});
    // res.send(token);
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
});

/* GET views listing. */
router.get("/views", function (req, res, next) {
  res.render("views", { title: "First pages" });
});

router.post("/login", function (req, res, next) {
  const _user = req.body.username;
  const _pass = req.body.password;

  console.log(_user);

  if (_user === "warin" && _pass === "123456") {
    res.send("Success!!");
    res.render("views", { title: "First pages" });
  } else {
    res.send("Something wrong");
  }
});

router.post("/product", async function (req, res, next) {
  try {
    const { product_name, price, amount } = req.body;

    console.log(product_name);
    let newProduct = new productsSchem({
      product_name: product_name,
      price: price,
      amount: amount,
    });

    let product = await newProduct.save();
    return res.status(201).send({
      data: product,
      message: "create success",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "create fail",
      success: false,
    });
  }
});

router.post("/",upload.single('profile'), async function (req, res, next) {
  try {
    let { name, age } = req.body;

    let save = await userSchema.create({ name, age });
    res.send(save);
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let { name, age } = req.body;

    let update = await userSchema.findByIdAndUpdate(id, { name, age });
    res.send(update);
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;

    let del = await userSchema.findByIdAndDelete(id, { id });
    res.send(del);
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
});

module.exports = router;
