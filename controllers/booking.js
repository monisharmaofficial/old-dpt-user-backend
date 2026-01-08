const AppError = require("../utils/appError");
require("dotenv").config();
const conn = require("../services/db");
const jwt = require("jsonwebtoken");
const token_key = process.env.TOKEN_KEY;

exports.get = (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(authToken, token_key);
  //user_id = decode.id;
  const tourorder_id = req.params.tourorder_id;
  let sqlQuery = `
  SELECT orderitems.*,
    tourorder.id AS tourorder_id,
    tourorder.user_type,
    tourorder.first_name,
    tourorder.last_name,
    tourorder.email,
    tourorder.nationality,
    tourorder.discover_us,
    tourorder.country,
    tourorder.cell_no,
    tourorder.special_equest,
    tourorder.currency,
    tourorder.tax,
    tourorder.sub_total,
    tourorder.discount,
    tourorder.total,
    tourorder.created_at
  FROM orderitems 
  JOIN tourorder ON orderitems.tourorder_id = tourorder.id
  WHERE orderitems.tourorder_id = ?;`;
  conn.query(sqlQuery, [tourorder_id], (err, result) => {
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

exports.get_order = (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(authToken, token_key);
  const user_id = decode.id;
  const sqlQuery = `
    SELECT tourorder.*
    FROM tourorder
    WHERE tourorder.user_id = ?;`;

  conn.query(sqlQuery, [user_id], (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      res.status(200).send({
        status: "success",
        length: result?.length || 0,
        data: result || [],
      });
    }
  });
};

exports.booking_detail = (req, res) => {
  // Assuming you have a variable `orderItemId` containing the ID you want to filter by
  const orderItemId = req.params.id; // Adjust how you get the order item ID

  const sqlQuery = `
    SELECT orderitems.*,
      tourorder.id AS tourorder_id,
      tourorder.user_type,
      tourorder.first_name,
      tourorder.last_name,
      tourorder.email,
      tourorder.nationality,
      tourorder.discover_us,
      tourorder.country,
      tourorder.cell_no,
      tourorder.special_equest,
      tourorder.currency,
      tourorder.tax,
      tourorder.sub_total,
      tourorder.discount,
      tourorder.total,
      tourorder.created_at
    FROM orderitems 
    JOIN tourorder ON orderitems.tourorder_id = tourorder.id
    WHERE orderitems.id = ?;`;

  conn.query(sqlQuery, [orderItemId], (err, result) => {
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

exports.getHotelsByStatus = (req, res) => {
  const sqlQuery = `
    SELECT *
    FROM hotels
    WHERE status = 1;
  `;

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
exports.getLatestOrders = (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(authToken, token_key);
  const user_id = decode.id;
  console.log(user_id);

  // Calculate the date 7 days ago
  const date = new Date();
  date.setDate(date.getDate() - 7); // Subtract 7 days

  let sqlQuery = `
    SELECT orderitems.*,
      tourorder.id AS tourorder_id,
      tourorder.user_type,
      tourorder.first_name,
      tourorder.last_name,
      tourorder.email,
      tourorder.nationality,
      tourorder.discover_us,
      tourorder.country,
      tourorder.cell_no,
      tourorder.special_equest,
      tourorder.currency,
      tourorder.tax,
      tourorder.sub_total,
      tourorder.discount,
      tourorder.total,
      tourorder.created_at
    FROM orderitems 
    JOIN tourorder ON orderitems.tourorder_id = tourorder.id
    WHERE orderitems.user_id = ? 
    AND orderitems.booking_date >= ?`;

  conn.query(sqlQuery, [user_id, date], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    } else {
      res.status(200).send({
        status: "success",
        length: result?.length,
        data: result,
      });
    }
  });
};

exports.getcanclOrders = (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(authToken, token_key);
  const user_id = decode.id;
  console.log(user_id);

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let sqlQuery = `
    SELECT orderitems.*,
      tourorder.id AS tourorder_id,
      tourorder.user_type,
      tourorder.first_name,
      tourorder.last_name,
      tourorder.email,
      tourorder.nationality,
      tourorder.discover_us,
      tourorder.country,
      tourorder.cell_no,
      tourorder.special_equest,
      tourorder.currency,
      tourorder.tax,
      tourorder.sub_total,
      tourorder.discount,
      tourorder.total,
      tourorder.created_at
    FROM orderitems 
    JOIN tourorder ON orderitems.tourorder_id = tourorder.id
    WHERE orderitems.status = 2`;

  conn.query(sqlQuery, [user_id], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    } else {
      res.status(200).send({
        status: "success",
        length: result?.length,
        data: result,
      });
    }
  });
};
