var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
var pizzaSchema = require("../models/pizzas.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { token } = require("morgan");

const sendResponse = (res, status, message, data) => {
  res.status(status).json({ status, message, data });
};

/*register*/
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, status } = req.body;

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
      status: status || "",
    });

    return sendResponse(res, 200, "Register success", users);
  } catch (error) {
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

/*login*/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password, status } = req.body;

    if (!(username && password)) {
      return sendResponse(res, 400, "Unsuccess, All input is require", []);
    }

    // Find user by username
    const users = await userSchema.findOne({ username });

    // Check if user exists and password matches
    if (users && (await bcrypt.compare(password, users.password))) {
      if (users.status == "approve") {
        const token = jwt.sign(
          {
            user_id: users._id,
            username: users.username,
            status: users.status,
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
    }else{
      // Username not found or password mismatch
      return sendResponse(res, 400, "Unsuccess, Invalid username or password", []);
    }
  } catch (error) {
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (token == null) return res.sendStatus(401); // if there is no token

  jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // if token is not valid
    req.user = user;
    next();
  });
}

/* GET pizza menu. */
router.get("/menu", authenticateToken, async function (req, res, next) {
  try {
    const pizzaMenu = await pizzaSchema.find();
    res.json(pizzaMenu);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
