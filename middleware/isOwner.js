const { verifyToken } = require("../utils/ownerToken");
const client = require("../database/db");

const isOwner = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ msg: "Access token is missing." });
    }

    const obj = verifyToken(token);
    if (!obj) {
      return res.status(403).json({ msg: "Invalid token." });
    }

    const { id, mail, role, active } = obj;

    if (role !== "owner" || !active) {
      return res.status(403).json({ msg: "You do not have permission to perform this action." });
    }

    // Check if the user exists in the database
    const sqlQuery = `SELECT * FROM users WHERE id = $1 AND mail = $2`;
    const result = await client.query(sqlQuery, [id, mail]);

    if (result.rows.length === 0) {
      return res.status(403).json({ msg: "You do not have permission to perform this action." });
    }

    // Add user information to the request body
    req.body.id = id;
    req.body.mail = mail;
    req.body.active = active;

    next();
  } catch (error) {
    console.error("Error in isOwner middleware:", error.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = isOwner;
