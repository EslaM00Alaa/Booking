require("dotenv").config();
const jwt = require("jsonwebtoken");
const SALT = process.env.SALT;
const expirationTime = '7 days'; // Explicitly specify the unit of time

function generateToken(id, mail, role, active) {
  console.log(active);
  return jwt.sign({ id, mail, role, active }, SALT, { expiresIn: expirationTime });
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SALT);
    const { id, mail, role, active } = decoded;
    return { id, mail, role, active };
  } catch (err) {
    // Handle token verification error
    console.error("Token verification failed:", err.message);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
