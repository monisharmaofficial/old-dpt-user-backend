const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
//const slugify = require("slugify");
const conn = require("../services/db");

exports.countery = (req, res) => {
  let sqlQuery = "SELECT * FROM  countries";

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

exports.state_1 = (req, res) => {
  const { country_name } = req.body; // Destructure the country_name from the request body

  if (!country_name) {
    return res.status(400).send({
      msg: "country name is required in the request body",
    });
  }

  let sqlQuery = "SELECT states FROM tours WHERE countries = ?";
  conn.query(sqlQuery, [country_name], (err, result) => {
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

exports.state_2 = (req, res) => {
  const { state } = req.body; // Destructure the country_name from the request body

  if (!state) {
    return res.status(400).send({
      msg: "state is required in the request body",
    });
  }

  let sqlQuery = "SELECT destination_name FROM tours WHERE states = ?";
  conn.query(sqlQuery, [state], (err, result) => {
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
