const isUser = require("../../middleware/isUser.js");
const sendMail = require("../../utils/sendMail.js");

const express = require("express"),
  client = require("../../database/db"),
  bcrypt = require("bcryptjs"),
  path = require("path"), // Add this line to import the path module
  fs = require("fs"),
  {
    validateFeedBack
  } = require("../../models/feedback.js"),
  photoUpload = require("../../utils/uploadimage.js"),
  {generateToken} = require("../../utils/ownerToken.js"),
  router = express.Router();


  router.post("/feedback", isUser, async (req, res) => {
    try {
        const { error } = validateFeedBack(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });

        const { id, description, writed_id } = req.body; 

        await client.query("INSERT INTO feedbacks (description, writer_id, writed_id) VALUES ($1, $2, $3);", [description, id, writed_id]); // Fixed variable name

        res.json({ msg: "done" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});




  module.exports=router;