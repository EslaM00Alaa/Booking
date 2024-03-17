const sendMail = require("../../utils/sendMail.js");

const express = require("express"),
  client = require("../../database/db"),
  bcrypt = require("bcryptjs"),
  path = require("path"), // Add this line to import the path module
  {
    validateUser,
    validateLogin,
    validateEmail,
    validateChangePass,
  } = require("../../models/user"),
  photoUpload = require("../../utils/uploadimage.js"),
  generateToken = require("../../utils/UserToken.js"),
  router = express.Router();

router.post("/user/register", photoUpload.single("image"), async (req, res) => {
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
        `INSERT INTO users (user_name, mail, pass, image) VALUES ($1, $2, $3, $4) RETURNING id, role, mail;`,
        [user_name, mail, hashedPass, imagePath]
      );
    } else {
      result = await client.query(
        `INSERT INTO users (user_name, mail, pass) VALUES ($1, $2, $3) RETURNING id, role, mail;`,
        [user_name, mail, hashedPass]
      );
    }

    const { id, mail: umail, role: urole } = result.rows[0];
    const token = generateToken(id, umail, urole);

    res.json({ role: urole, token: token });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/user/login", async (req, res) => {
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

router.post("/user/verifycode", async (req, res) => {
  try {
    const { error } = validateEmail(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const sqlQuery = "SELECT * FROM users WHERE mail = $1";
    const result = await client.query(sqlQuery, [req.body.mail]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      const salt = await bcrypt.genSalt(10);
      const hashedNumber = await bcrypt.hash(randomNumber.toString(), salt);

      const sqlQuery1 = "UPDATE users SET verify_code = $1 WHERE id = $2";
      await client.query(sqlQuery1, [hashedNumber.toString().trim(), user.id]);
      sendMail(req.body.mail, randomNumber, "verifycode");
      res.json("email send successfully !");
    } else {
      return res.status(404).json({ msg: "No account for this user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/user/resetpass", async (req, res) => {
  const { error } = validateChangePass({
    code: req.body.code,
    mail: req.body.mail,
    pass: req.body.pass,
  });
  if (error) return res.status(404).json({ msg: error.details[0].message });
  const salt = await bcrypt.genSalt(10);
  req.body.pass = await bcrypt.hash(req.body.pass, salt);
  const verifycode = req.body.code.trim(); // Trim the verify code
  const pass = req.body.pass;
  const mail = req.body.mail;
  const sqlQuery = "SELECT * FROM users WHERE mail = $1";
  const result = await client.query(sqlQuery, [mail]);

  const user = result.rows[0];
  console.log(user);
  let isPasswordMatch = await bcrypt.compare(
    verifycode,
    user.verify_code.trim()
  ); // Trim the user.verify_code
  console.log(isPasswordMatch);
  if (isPasswordMatch) {
    const sqlQuery1 = "UPDATE users SET pass = $1 WHERE id = $2";
    await client.query(sqlQuery1, [pass, user.id]);

    res.json({ msg: "password is changed" });
  } else {
    res.status(404).json({ msg: "verify code is not correct" });
  }
});

module.exports = router;
