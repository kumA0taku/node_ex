var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { token } = require("morgan");

/*register*/
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, status } = req.body;

    // Check for missing required fields
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      res.status(401).send("Username already exists");
    }

    //encrypt password
    const encryptPass = await bcrypt.hash(password, 10);

    //save user data to Database
    const users = await userSchema.create({
      username,
      password: encryptPass,
      status: status || null,
    });
//remove token from register
    const token = jwt.sign(
      {
        user_id: users._id,
        username,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    users.token = token;
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

/*login*/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password, status } = req.body;

    if (!(username && password)) {
      res.status(400).send("All input is require");
    }

    const users = await userSchema.findOne({ username });

    if (users && (await bcrypt.compare(password, users.password))) {
      if (users.status == "approve") {
        const token = jwt.sign(
          { user_id: users._id, username, status },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        users.token = token; //compare token of user
        console.log(token)
        console.log(users)
        res.status(200).json(users);
      } else {
        return res.status(403).send("User is not approved");
      }
    }
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).send("Duplicate key error");
    }
    res.status(500).send("An error occurred");
  }
});

/* GET pizza menu. */
router.get("/menu", async function (req, res, next) {
  //authen token
  //query data
 
});

module.exports = router;
