
const express = require("express"),
  client = require("../../database/db"),
  bcrypt = require("bcryptjs"),
  path = require("path"), // Add this line to import the path module
  fs = require("fs"),
  {
    validateUser,
    validateLogin,
    validateEmail,
    validateChangePass,
  } = require("../../models/user"),
  photoUpload = require("../../utils/uploadimage.js"),
  generateToken = require("../../utils/ownerToken.js"),
  router = express.Router();

router.post("/admin/register", photoUpload.single("image"), async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    let imagePath = null; // Initialize imagePath
    if (req.file) {
      // Check if file is uploaded
      imagePath = `http://localhost:6666/images/${req.file.filename}`; // Assuming images are stored in the "profile" folder
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.pass, salt);

    const { user_name, mail } = req.body;
    let result;
    // Fix the query to insert user data into the database
    if (imagePath) {
      result = await client.query(
        `INSERT INTO users (user_name, mail, pass,role,image) VALUES ($1, $2, $3, $4,$5) RETURNING id, role, mail;`,
        [user_name, mail, hashedPass,"admin",imagePath]
      );
    } else {
      result = await client.query(
        `INSERT INTO users (user_name, mail, pass,role,active) VALUES ($1, $2, $3) RETURNING id, role, mail;`,
        [user_name, mail, hashedPass,"owner",false]
      );
    }

    const { id, mail: umail, role: urole } = result.rows[0];
    const token = generateToken(id, umail, urole,false);

    res.json({ role: urole, token: token });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    let { mail, pass } = req.body;

    let sqlQuery = `SELECT * FROM users WHERE mail = $1 `;
    let result = await client.query(sqlQuery, [mail]);

    if (result.rows.length > 0) {
      const isPasswordMatch = await bcrypt.compare(pass, result.rows[0].pass);

      if (isPasswordMatch) {
        const { pass, verify_code, ...userData } = result.rows[0];
        return res.json({
          token: generateToken(
            result.rows[0].id,
            result.rows[0].mail,
            result.rows[0].role
          ),
          data: userData,
        });
      } else {
        return res.status(400).json({ msg: "Invalid username or password" });
      }
    } else {
      res.status(404).json({ msg: "Invalid username or password" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});



module.exports = router ;