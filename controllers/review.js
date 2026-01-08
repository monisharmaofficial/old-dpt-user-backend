const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const jwt = require("jsonwebtoken");
const token_key = process.env.TOKEN_KEY;

exports.get = (req, res) => {
  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(authToken, token_key);
    user_id = decode.id;
  } else {
    return res.status(500).send({
      msg: err,
    });
  }
  let sqlQuery = "SELECT * FROM reviews WHERE user_id = ?";
  conn.query(sqlQuery, [user_id], (err, result) => {
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
exports.register = (req, res) => {
  let user_id;
  const orderItemId = req.params.id; // Assuming you get the order item ID
  //console.log(orderItemId);
  try {
    if (req.headers.authorization) {
      const authToken = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(authToken, token_key);
      user_id = decode.id;
    } else {
      throw new Error("Authorization token not found");
    }

    const getUserQuery = `SELECT id, first_name, email, country FROM users WHERE id = ?`;
    const getOrderItemQuery = `SELECT tour_id FROM orderitems WHERE id = ?`;
    const checkReviewQuery = `SELECT * FROM reviews WHERE orderitem_id = ? AND user_id = ?`;

    conn.query(getUserQuery, [user_id], (err, userResult) => {
      if (err) {
        throw err;
      } else {
        conn.query(getOrderItemQuery, [orderItemId], (err, orderItemResult) => {
          if (err) {
            throw err;
          }

          if (!orderItemResult || !orderItemResult.length) {
            return res.status(404).send({ msg: "Order item not found" });
          }

          const tourId = orderItemResult[0].tour_id;

          conn.query(
            checkReviewQuery,
            [orderItemId, user_id],
            (err, reviewResult) => {
              if (err) {
                throw err;
              }

              if (reviewResult && reviewResult.length > 0) {
                return res.status(409).send({
                  msg: "Review already exists for this order item",
                });
              }

              const date_time = new Date();
              const insertReviewQuery = `
              INSERT INTO reviews (user_id, tour_id, orderitem_id, name, email, country, rating, comments, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
              const values = [
                user_id,
                tourId,
                orderItemId,
                userResult[0].first_name,
                userResult[0].email,
                userResult[0].country,
                req.body.rating,
                req.body.comments,
                date_time,
                date_time,
              ];

              conn.query(insertReviewQuery, values, (err, reviewResult) => {
                if (err) {
                  throw err;
                } else {
                  res.status(200).send({
                    status: "success",
                    msg: "Review added successfully",
                  });
                }
              });
            }
          );
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      msg: error.message || "Internal Server Error",
    });
  }
};

exports.edit = (req, res) => {
  let sqlQuery = "SELECT * FROM reviews WHERE id=" + req.params.id;
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

exports.tour_review_list = (req, res) => {
  let sqlQuery = "SELECT * FROM reviews WHERE tour_id=" + req.params.id;
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

exports.update = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var date_time = new Date();
  const sqlQuery = `UPDATE reviews SET rating = ?,comments = ?,updated_at=? WHERE id = ?;`;
  const values = [req.body.rating, req.body.comments, date_time, req.params.id];
  conn.query(sqlQuery, values, (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      res.status(200).send({
        status: "success",
        msg: "Reviews update successful",
      });
    }
  });
};
