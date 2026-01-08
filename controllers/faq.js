const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const randomstring = require("randomstring");
const sendMail = require("../helper/sendMail");

exports.get = (req, res) => {
  let sqlQuery = "SELECT * FROM faq WHERE status = 1";

  conn.query(sqlQuery, (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      res.status(200).send({
        status: "success",
        length: result?.length,
        data: result,
      });
    }
  });
};
