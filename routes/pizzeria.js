var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
var pizzaSchema = require("../models/pizzas.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
// const { token } = require("morgan");
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
    const { username, password, approve } = req.body;

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

/* PUT approve status */
router.put("/approve/:id", auth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    // Find and update the user's status
    const users = await userSchema.findById(id);
    if (!users) {
      return sendResponse(res, 400, "Unsuccess, User not found", []);
    }
    users.approve = approve;
    console.log(users)
    await users.save();

    // return sendResponse(res, 200, "Login success", users);
    return sendResponse(res, 200, "User has been Approved!", users);
  } catch (error) {
    console.error('error ', error)
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

module.exports = router;
