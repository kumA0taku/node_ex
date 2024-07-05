var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
var pizzaSchema = require("../models/pizzas.model");
var ordersSchema = require("../models/orders.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var auth = require("../middleware/auth");

const sendResponse = (res, status, message, data) => {
  res.status(status).json({ status, message, data });
};

/*register*/
router.post("/register", async function (req, res, next) {
  try {
    const { username, password } = req.body;

    // Check for missing required fields
    if (!username || !password) {
      return sendResponse(
        res,
        400,
        "unsuccess, check your username or password",
        []
      );
    }

    const existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      return sendResponse(
        res,
        400,
        "unsuccess, Please use another username",
        []
      );
    }

    //encrypt password
    const encryptPass = await bcrypt.hash(password, 10);

    //save user data to Database
    const users = await userSchema.create({
      username,
      password: encryptPass,
    });

    const token = jwt.sign(
      {
        user_id: users._id,
        username: users.username,
        approve: users.approve,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    users.token = token;

    return sendResponse(res, 200, "Register success", users);
  } catch (error) {
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/*login*/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return sendResponse(res, 400, "Unsuccess, All input is require", []);
    }

    // Find user by username
    const users = await userSchema.findOne({ username });

    // Check if user exists and password matches
    if (users && (await bcrypt.compare(password, users.password))) {
      if (users.approve == true) {
        const token = jwt.sign(
          {
            user_id: users._id,
            username: users.username,
            approve: users.approve,
          },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        users.token = token;

        // Send success response with user data
        return sendResponse(res, 200, "Login success", users);
      } else {
        // User not approved
        return sendResponse(res, 401, "Not approve, User is not approved", []);
      }
    } else {
      // Username not found or password mismatch
      return sendResponse(
        res,
        400,
        "Unsuccess, Invalid username or password",
        []
      );
    }
  } catch (error) {
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/*add pizza menu*/
router.post("/menu/", auth, async function (req, res, next) {
  try {
    const { menu, price, stoke } = req.body;

    if (!(menu || price || stoke)) {
      return sendResponse(res, 400, "Unsuccess, All input is require", []);
    }

    // Check if pizza menu exists
    const existingMenu = await pizzaSchema.findOne({ menu });
    if (existingMenu) {
      return sendResponse(
        res,
        400,
        "unsuccess, You already have this menu",
        []
      );
    }

    //save menu to Database
    const addMenu = await pizzaSchema.create({
      menu,
      price,
      stoke,
    });
    console.log(addMenu);

    return sendResponse(res, 200, "success", addMenu);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/*add pizza orders*/
router.post("/orders/:id/orders", auth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (!id) {
      return sendResponse(res, 400, "Unsuccess, please enter pizza id", []);
    }

    const pizzaName = await pizzaSchema.findById(id);

    if (pizzaName.stoke === 0) {
      return sendResponse(res, 400, "Unsuccess, pizza out of stock", []);
    } else {
      const addOrders = await ordersSchema.create({
        pizza_id: id,
        pizza_name: pizzaName.menu,
        qty: qty,
      });
      await pizzaSchema.findByIdAndUpdate(id, { stoke: pizzaName.stoke - qty });
      return sendResponse(res, 200, "success", addOrders);
    }
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* PUT approve status */
router.put("/approve/id/:id", auth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    // Find and update the user's status
    const users = await userSchema.findById(id);
    if (!users) {
      return sendResponse(res, 400, "Unsuccess, User not found", []);
    }
    users.approve = approve;
    console.log(users);
    await users.save();

    // return sendResponse(res, 200, "Login success", users);
    return sendResponse(res, 200, "User has been Approved!", users);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* PUT pizza menu */
router.put("/menu/id/:id", auth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { menu, price, stoke } = req.body;

    // Find and update the user's status
    const pizzaMenu = await pizzaSchema.findById(id);
    if (!pizzaMenu) {
      return sendResponse(res, 400, "Unsuccess, this menu not found", []);
    }
    pizzaMenu.menu = menu;
    pizzaMenu.price = price;
    pizzaMenu.stoke = stoke;
    await pizzaMenu.save();

    return sendResponse(res, 200, "success", pizzaMenu);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* delete pizza menu */
router.delete("/menu/id/:id", async function (req, res, next) {
  try {
    let { id } = req.params;

    // Find and delete pizza menu
    const pizzaMenu = await pizzaSchema.findById(id);
    if (!pizzaMenu) {
      return sendResponse(res, 400, "Unsuccess, this menu not found", []);
    }
    let delMenu = await pizzaSchema.findByIdAndDelete(id, { id });
    return sendResponse(res, 200, "success", delMenu);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/*delete pizza orders*/
router.delete("/orders/id/:id", auth, async function (req, res, next) {
  try {
    const { id } = req.params;

    // Find and delete pizza menu
    const pizzaOrders = await ordersSchema.findById(id);
    if (!pizzaOrders) {
      return sendResponse(res, 400, "Unsuccess, please enter orders id", []);
    }
    let delOrders = await ordersSchema.findByIdAndDelete(id, { id });
    return sendResponse(res, 200, "success", delOrders);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* GET pizza menu. */
router.get("/menu", auth, async function (req, res, next) {
  try {
    // get all product
    const menuPizzas = await pizzaSchema.find();

    return sendResponse(res, 200, "success", menuPizzas);
  } catch (error) {
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* GET pizza menu by id. */
router.get("/menu/id/:id", auth, async function (req, res, next) {
  try {
    const { id } = req.params;

    // Find and update the user's status
    const menuPizzas = await pizzaSchema.findById(id);
    if (!menuPizzas) {
      return sendResponse(res, 400, "Unsuccess, menu not found", []);
    }

    return sendResponse(res, 200, "success", menuPizzas);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* GET pizza orders. */
router.get("/orders", auth, async function (req, res, next) {
  try {
    // get all product
    const orderPizzas = await ordersSchema.find();

    return sendResponse(res, 200, "success", orderPizzas);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/* GET pizza orders map product. */
router.get("/orders/:id/orders", auth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { pizza_name } = req.query;

    const orderPizzas = await ordersSchema.find({ pizza_id: id });
    console.log(orderPizzas);

    if (!orderPizzas || orderPizzas.length === 0) {
      return sendResponse(res, 404, "Order not found", []);
    }
    // If you need to filter by pizza_name, add the filtering logic
    const filteredOrders = pizza_name
      ? orderPizzas.filter((order) => order.pizza_name == pizza_name)
      : orderPizzas;

    console.log(filteredOrders);

    if (filteredOrders.length === 0) {
      return sendResponse(res, 404, "Pizza name not found in orders", []);
    }

    return sendResponse(res, 200, "success", filteredOrders);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

module.exports = router;
