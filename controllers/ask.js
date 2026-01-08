const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const sendMail = require("../helper/sendMail");
const fs = require("fs/promises");
const ejs = require("ejs");

// add ask
exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var date_time = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sqlQuery = `INSERT INTO ask (name, email, nationality, discover_us, country_code, call_no, address, subject, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.nationality,
    req.body.discover_us,
    req.body.country_code,
    req.body.call_no,
    req.body.address,
    req.body.subject,
    req.body.message,
    date_time,
    date_time,
  ];
  conn.query(sqlQuery, values, async (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      let mailSubjet = "Ask Questions";
      const template = await fs.readFile("views/askmail.ejs", "utf-8");
      const content = ejs.render(template, {
        name: req.body.name,
        email: req.body.email,
        nationality: req.body.nationality,
        discover_us: req.body.discover_us,
        country_code: req.body.country_code,
        call_no: req.body.call_no,
        address: req.body.address,
        subject: req.body.subject,
        message: req.body.message,
      });
      sendMail(req.body.email, mailSubjet, content);
      res.status(200).send({
        status: "success",
        msg: "Ask Questions Register successful",
      });
    }
  });
};
