const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for Authentication");
  }

  //if have Token
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.users = decoded;
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
  return next()
}
module.exports = verifyToken
