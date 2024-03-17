require("dotenv").config();
const jwt = require("jsonwebtoken");
const SALT = process.env.SALT;

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SALT);
    const { id, mail,role,active } = decoded;
    return { id, mail,role,active };
  } catch (err) {
    // Handle token verification error
    console.error("Token verification failed:", err.message);
    return null;
  }
}

module.exports = verifyToken;
