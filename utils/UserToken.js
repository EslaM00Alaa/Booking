require("dotenv").config();
const jwt = require("jsonwebtoken");
const SALT = process.env.SALT;
const expirationTime = '7d';
function generateToken(id, mail,role) {
  return jwt.sign({ id, mail , role }, SALT, { expiresIn: expirationTime });
}

module.exports = generateToken;