require("dotenv").config();
const jwt = require("jsonwebtoken");
const SALT = process.env.SALT;
const expirationTime = '7d';
function generateToken(id, mail,role,active) {
  return jwt.sign({ id, mail , role , active }, SALT, { expiresIn: expirationTime });
}

module.exports = generateToken;