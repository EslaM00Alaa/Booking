const isOwner = require("../../middleware/isOwner.js");
const sendMail = require("../../utils/sendMail.js");

const express = require("express"),
  client = require("../../database/db"),
  bcrypt = require("bcryptjs"),
  path = require("path"), // Add this line to import the path module
  fs = require("fs"),
  {
    validateUser
  } = require("../../models/user"),
  photoUpload = require("../../utils/uploadimage.js"),
  {generateToken} = require("../../utils/ownerToken.js"),
  router = express.Router();

router.post("/owner/register", photoUpload.single("image"), async (req, res) => {
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
        `INSERT INTO users (user_name, mail, pass,role,image,active) VALUES ($1, $2, $3, $4,$5,$6) RETURNING * ;`,
        [user_name, mail, hashedPass,"owner",imagePath,false]
      );
    } else {
      result = await client.query(
        `INSERT INTO users (user_name, mail, pass,role,active) VALUES ($1, $2, $3) RETURNING * ;`,
        [user_name, mail, hashedPass,"owner",false]
      );
    }

    const { id, mail: umail, role: urole } = result.rows[0];
    const token = generateToken(id, umail, urole,false);
    let {verify_code,pass,...data}= result.rows[0]
    res.json({ token: token , data });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});


router.post("/attachment", photoUpload.single("image"), isOwner, async (req, res) => {
  try {
   
    let imagePath = null;

    if (req.file) {
      imagePath = `http://localhost:6666/images/${req.file.filename}`;
      // Insert the owner_id and attachment path into the owner_attachment table
      await client.query("INSERT INTO owner_attachment (owner_id, attachment) VALUES ($1, $2)", [req.body.id, imagePath]);
      res.status(200).json({ msg: "Image uploaded successfully" });
    } else {
      // If no file is uploaded, return an error response
      res.status(400).json({ msg: "You must send an image" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});



module.exports = router;
