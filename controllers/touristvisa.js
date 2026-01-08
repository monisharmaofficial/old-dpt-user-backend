const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const sendMail = require("../helper/sendMail");
const fs = require("fs/promises");
const ejs = require("ejs");

exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var date_time = new Date();
  const sqlQuery = `INSERT INTO touristvisa (name, email, nationality, country, cell_no, arrival_date, departure_date, no_of_people, how_did_you_discover_us, upload_hotel_booking, upload_your_flight_ticket, upload_passport_copy, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.nationality,
    req.body.country,
    req.body.cell_no,
    req.body.arrival_date,
    req.body.departure_date,
    req.body.no_of_people,
    req.body.how_did_you_discover_us,
    req.body.upload_hotel_booking,
    req.body.upload_your_flight_ticket,
    req.body.upload_passport_copy,
    date_time,
    date_time,
  ];
  conn.query(sqlQuery, values, async (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      let mailSubjet = "TOURIST VISA";
      const template = await fs.readFile("views/touristvisa.ejs", "utf-8");
      const content = ejs.render(template, {
        name: req.body.name,
        email: req.body.email,
        country: req.body.country,
        cell_no: req.body.cell_no,
        nationality: req.body.nationality,
        arrival_date: req.body.arrival_date,
        departure_date: req.body.departure_date,
        no_of_people: req.body.no_of_people,
        how_did_you_discover_us: req.body.how_did_you_discover_us,
        upload_hotel_booking: req.body.upload_hotel_booking,
        upload_your_flight_ticket: req.body.upload_your_flight_ticket,
        upload_hotel_booking: req.body.upload_passport_copy,
        created_at: req.body.date_time,
        updated_at: req.body.date_time,
      });
      sendMail(req.body.email, mailSubjet, content);
      res.status(200).send({
        status: "success",
        msg: "Tourist Visa Register successful",
      });
    }
  });
};
