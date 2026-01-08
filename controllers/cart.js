const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const randomstring = require("randomstring");
const sendMail = require("../helper/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const ejs = require("ejs");
const token_key = process.env.TOKEN_KEY;

exports.add_wishlist = (req, res) => {
  let user_id;
  let user_type;

  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(authToken, token_key);
    user_id = decode.id;
    user_type = "Reg";
  } else {
    if (!req.session.randomId) {
      req.session.randomId = randomstring.generate({
        length: 4,
        charset: "numeric",
      });
    }
    user_id = req.session.randomId;
    user_type = "Not-Reg";
  }

  const date_time = new Date();
  const tourId = req.body.tour_id;
  const selectQuery = `SELECT * FROM wishlist_cart WHERE user_id = ? AND user_type = ? AND tour_id = ?`;
  const selectValues = [user_id, user_type, tourId];

  conn.query(selectQuery, selectValues, (selectErr, selectResult) => {
    if (selectErr) {
      return res.status(500).send({
        msg: selectErr,
      });
    } else {
      if (selectResult.length > 0) {
        const deleteQuery = `DELETE FROM wishlist_cart WHERE user_id = ? AND user_type = ? AND tour_id = ?`;
        const deleteValues = [user_id, user_type, tourId];

        conn.query(deleteQuery, deleteValues, (deleteErr, deleteResult) => {
          if (deleteErr) {
            return res.status(500).send({
              msg: deleteErr,
            });
          }
          res.status(200).send({
            status: "success",
            msg: "Delete to wishlist successfully",
          });
        });
      } else {
        // If wishlist doesn't exist, directly add to wishlist
        const insertQuery = `INSERT INTO wishlist_cart (user_id, user_type, tour_id, added_on) VALUES (?, ?, ?, ?)`;
        const insertValues = [user_id, user_type, tourId, date_time];

        conn.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            return res.status(500).send({
              msg: insertErr,
            });
          }

          res.status(200).send({
            status: "success",
            msg: "Added to wishlist successfully",
          });
        });
      }
    }
  });
};

exports.wishlist_count = (req, res) => {
  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(authToken, token_key);
    const user_id = decode.id;

    const condition = user_id;
    const sqlQuery =
      "SELECT COUNT(*) AS count FROM wishlist_cart WHERE user_id = ?";

    conn.query(sqlQuery, [condition], (err, result) => {
      if (err) {
        return res.status(500).send({
          msg: err,
        });
      } else {
        const count = result[0].count || 0;
        res.status(200).send({
          status: "success",
          count: count,
        });
      }
    });
  } else if (req.session.randomId) {
    const user_id = req.session.randomId;
    const condition = user_id;
    const sqlQuery =
      "SELECT COUNT(*) AS count FROM wishlist_cart WHERE user_id = ?";

    conn.query(sqlQuery, [condition], (err, result) => {
      if (err) {
        return res.status(500).send({
          msg: err,
        });
      } else {
        const count = result[0].count || 0;
        res.status(200).send({
          status: "success",
          count: count,
        });
      }
    });
  } else {
    res.status(401).send({
      status: "error",
      msg: "wishlist Count Not Found",
    });
  }
};

exports.wishlist_detail_list = (req, res) => {
  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(authToken, token_key);
    const user_id = decode.id;
    const query = `
    SELECT
      c.*,
      t.tour_id,
      t.tour_name,
      t.tour_image,
      t.tour_discount,
      t.tour_tour_price_aed,
      t.tour_tour_price_usd,
      t.tour_slug
    FROM wishlist_cart c
    LEFT JOIN (
      SELECT c.id AS c_id,
       GROUP_CONCAT(t.id) AS tour_id,
        GROUP_CONCAT(t.tour_name) AS tour_name,
        GROUP_CONCAT(t.intro) AS tour_intro,
        GROUP_CONCAT(t.image) AS tour_image,
        GROUP_CONCAT(t.tour_price_aed) AS tour_tour_price_aed,
        GROUP_CONCAT(t.tour_price_usd) AS tour_tour_price_usd,
        GROUP_CONCAT(t.discount) AS tour_discount,
        GROUP_CONCAT(t.slug) AS tour_slug
      FROM wishlist_cart c
      LEFT JOIN tours t ON FIND_IN_SET(c.tour_id, t.id)
      GROUP BY c.id
    ) t ON c.id = t.c_id
    WHERE c.user_id = ?;`;

    conn.query(query, [user_id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({
          status: "error",
          msg: "Internal Server Error",
          error: error.message,
        });
      } else {
        const tours = results.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          tour_id: row.tour_id,
          user_type: row.user_type,
          description: row.description,
          added_on: row.added_on,
          tour_info: row.tour_name
            ? row.tour_name.split(",").map((Tour_name, index) => ({
                Tour_name: Tour_name,
                tour_slug: row.tour_slug && row.tour_slug.split(",")[index],
                tour_image: row.tour_image && row.tour_image.split(",")[index],
                tour_discount:
                  row.tour_discount && row.tour_discount.split(",")[index],
                tour_tour_price_aed:
                  row.tour_tour_price_aed &&
                  row.tour_tour_price_aed.split(",")[index],
                tour_tour_price_usd:
                  row.tour_tour_price_usd &&
                  row.tour_tour_price_usd.split(",")[index],
              }))
            : [],
        }));

        res.status(200).send({
          status: "success",
          length: results?.length || 0,
          data: tours,
        });
      }
    });
  } else {
    const user_id = req.session.randomId;
    const query = `
    SELECT
      c.*,
      t.tour_id,
      t.tour_name,
      t.tour_image,
      t.tour_discount,
      t.tour_tour_price_aed,
      t.tour_tour_price_usd,
      t.tour_slug
    FROM wishlist_cart c
    LEFT JOIN (
      SELECT c.id AS c_id,
       GROUP_CONCAT(t.id) AS tour_id,
        GROUP_CONCAT(t.tour_name) AS tour_name,
        GROUP_CONCAT(t.intro) AS tour_intro,
        GROUP_CONCAT(t.image) AS tour_image,
        GROUP_CONCAT(t.tour_price_aed) AS tour_tour_price_aed,
        GROUP_CONCAT(t.tour_price_usd) AS tour_tour_price_usd,
        GROUP_CONCAT(t.discount) AS tour_discount,
        GROUP_CONCAT(t.slug) AS tour_slug
      FROM wishlist_cart c
      LEFT JOIN tours t ON FIND_IN_SET(c.tour_id, t.id)
      GROUP BY c.id
    ) t ON c.id = t.c_id
    WHERE c.user_id = ?;`;

    conn.query(query, [user_id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({
          status: "error",
          msg: "Internal Server Error",
          error: error.message,
        });
      } else {
        const tours = results.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          tour_id: row.tour_id,
          user_type: row.user_type,
          description: row.description,
          added_on: row.added_on,
          tour_info: row.tour_name
            ? row.tour_name.split(",").map((Tour_name, index) => ({
                Tour_name: Tour_name,
                tour_slug: row.tour_slug && row.tour_slug.split(",")[index],
                tour_image: row.tour_image && row.tour_image.split(",")[index],
                tour_discount:
                  row.tour_discount && row.tour_discount.split(",")[index],
                tour_tour_price_aed:
                  row.tour_tour_price_aed &&
                  row.tour_tour_price_aed.split(",")[index],
                tour_tour_price_usd:
                  row.tour_tour_price_usd &&
                  row.tour_tour_price_usd.split(",")[index],
              }))
            : [],
        }));

        res.status(200).send({
          status: "success",
          length: results?.length || 0,
          data: tours,
        });
      }
    });
  }
};

exports.delete = (req, res) => {
  const id = req.params.id;
  const checkQuery = "SELECT * FROM wishlist_cart WHERE id = ?";

  conn.query(checkQuery, [id], (error, results) => {
    if (error) {
      return res.status(500).send({
        msg: error,
      });
    } else if (results.length === 0) {
      return res.status(404).send({
        msg: "Wishlist item not found",
      });
    } else {
      const deleteQuery = "DELETE FROM wishlist_cart WHERE id = ?";
      conn.query(deleteQuery, [id], (err, result) => {
        if (err) {
          return res.status(500).send({
            msg: err,
          });
        } else {
          res.status(200).send({
            status: "success",
            msg: "Wishlist delete successful",
          });
        }
      });
    }
  });
};

// Orderid genrate ======
let orderIdCounter = 1;

function generateOrderId() {
  const orderId = `ORD${orderIdCounter.toString().padStart(5, "0")}`;
  orderIdCounter++;
  return orderId;
}

// Booking

const generateRandomPassword = () => {
  const length = 6;
  const charset = "123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const checkEmailExists = (email) => {
  return new Promise((resolve, reject) => {
    const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
    conn.query(checkEmailQuery, [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0);
      }
    });
  });
};

const insertNewUser = (first_name, last_name, email, password) => {
  return new Promise(async (resolve, reject) => {
    let mailSubjet = "Password";

    const template = await fs.readFile("views/send-password.ejs", "utf-8");
    const content = ejs.render(template, {
      email: email,
      password: password,
    });
    sendMail(email, mailSubjet, content);

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt (using a salt of 10 rounds)
    const insertUserQuery = `INSERT INTO users (first_name,last_name,email, password,user_type) VALUES (?, ?,?,?,?)`;
    conn.query(
      insertUserQuery,
      [first_name, last_name, email, hashedPassword, 3],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
exports.add_to_cart_old = async (req, res) => {
  let user_id;
  let user_type;

  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(authToken, token_key);
    user_id = decode.id;
    user_type = "Reg";
  } else {
    const emailExists = await checkEmailExists(req.body.email);

    if (emailExists) {
      return res
        .status(400)
        .send({ msg: "Email already exists. Please log in." });
    } else {
      const randomPassword = generateRandomPassword();

      try {
        const insertedUser = await insertNewUser(
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          randomPassword
        );
        user_id = insertedUser.insertId;
        user_type = "Reg";
      } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Internal server error" });
      }
    }
  }

  const date_time = new Date();

  const insertOrderQuery = `INSERT INTO tourorder 
    (user_id, user_type, first_name, last_name, email, nationality, discover_us, special_equest, country, cell_no, currency, tax, sub_total, discount, total, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const orderValues = [
    user_id,
    user_type,
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    req.body.nationality,
    req.body.discover_us,
    req.body.special_equest,
    req.body.country,
    req.body.cell_no,
    req.body.currency,
    req.body.tax,
    req.body.sub_total,
    req.body.discount,
    req.body.total,
    date_time,
  ];

  try {
    await conn.query(insertOrderQuery, orderValues, async (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: "Internal server error" });
      }

      const lastInsertId = result.insertId;

      const insertOrderItemsQuery = `INSERT INTO orderitems 
      (tourorder_id, user_id, tour_id, tour_name, tour_slug,tour_image, tourPriceAed, tourPriceUsd, tour_date, pickup_time, pickup_location,otherPlaceName,otherPlaceAddress,otherPlaceTelephone, end_location, hotel_name, language, language_price, tour_currency, payment_mode, adults,adult_price, children, children_price, infants,infants_price, addition_driver, driver_total_price, additional_lunch, lunch_price, itinerary_name, additional_tickets_price, special_request,order_id,tourtotal, booking_date,last_reminder_date,next_reminder_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const cartData = req.body.cart_data;

      const itemsInsertPromises = cartData.map((item) => {
        const newOrderId = generateOrderId();
        const orderItemsValues = [
          lastInsertId,
          user_id,
          item.tour_id,
          item.tourName,
          item.tour_slug,
          item.tourImage,
          item.tourPriceAed,
          item.tourPriceUsd,
          item.tourDate,
          item.preferredPickupTime,
          item.preferredPickupLocation,
          item.otherPlaceName,
          item.otherPlaceAddress,
          item.otherPlaceTelephone,
          item.preferredEndLocation,
          item.preferredHotelName,
          item.language,
          item.languagePrice,
          item.preferredCurrency,
          item.preferredPay,
          item.adults,
          item.adultPrice,
          item.children,
          item.childrenPrice,
          item.infants,
          item.infantsPrice,
          item.preferredDriver,
          item.driverTotalPrice,
          item.preferredLunc,
          item.lunchPrice,
          item.itinerary_name,
          item.additionalTickets,
          item.specialRequest,
          newOrderId,
          item.tourtotal,
          date_time,
          date_time,
          date_time,
        ];

        conn.query(
          insertOrderItemsQuery,
          orderItemsValues,
          async (error, result) => {}
        );
      });

      //await Promise.all(itemsInsertPromises);

      res.status(200).send({
        status: "success",
        msg: "Add to Cart successful",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};

exports.add_to_cart = async (req, res) => {
  let user_id;
  let user_type;

  try {
    if (req.headers.authorization) {
      const authToken = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(authToken, token_key);
      user_id = decode.id;
      user_type = "Reg";
    } else {
      const emailExists = await checkEmailExists(req.body.email);

      if (emailExists) {
        return res
          .status(400)
          .send({ msg: "Email already exists. Please log in." });
      } else {
        const randomPassword = generateRandomPassword();

        try {
          const insertedUser = await insertNewUser(
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            randomPassword
          );
          user_id = insertedUser.insertId;
          user_type = "Reg";
        } catch (error) {
          console.error(error);
          return res.status(500).send({ msg: "Internal server error" });
        }
      }
    }

    const date_time = new Date();

    const insertOrderQuery = `INSERT INTO tourorder 
    (user_id, user_type, first_name, last_name, email, nationality, discover_us, special_equest, country, cell_no, currency, tax, sub_total, discount, total, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const orderValues = [
      user_id,
      user_type,
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.nationality,
      req.body.discover_us,
      req.body.special_equest,
      req.body.country,
      req.body.cell_no,
      req.body.currency,
      req.body.tax,
      req.body.sub_total,
      req.body.discount,
      req.body.total,
      date_time,
    ];

    await conn.query(insertOrderQuery, orderValues, async (error, result) => {
      if (error) {
        //console.error(error);
        //return res.status(500).send({ msg: "Internal server error" });
        return res.status(500).send({ msg: error });
      }

      const lastInsertId = result.insertId;

      const insertOrderItemsQuery = `INSERT INTO orderitems 
      (tourorder_id, user_id, tour_id, tour_name, tour_slug,tour_image, tourPriceAed, tourPriceUsd, tour_date, pickup_time, pickup_location,otherPlaceName,otherPlaceAddress,otherPlaceTelephone, end_location, hotel_name, language, language_price, tour_currency, payment_mode, adults,adult_price, children, children_price, infants,infants_price, addition_driver, driver_total_price, additional_lunch, lunch_price, itinerary_name, additional_tickets_price, special_request,order_id,tourtotal, booking_date,last_reminder_date,next_reminder_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const cartData = req.body.cart_data;

      const itemsInsertPromises = cartData.map((item) => {
        return new Promise((resolve, reject) => {
          const newOrderId = generateOrderId();
          const orderItemsValues = [
            lastInsertId,
            user_id,
            item.tour_id,
            item.tourName,
            item.tour_slug,
            item.tourImage,
            item.tourPriceAed,
            item.tourPriceUsd,
            item.tourDate,
            item.preferredPickupTime,
            item.preferredPickupLocation,
            item.otherPlaceName,
            item.otherPlaceAddress,
            item.otherPlaceTelephone,
            item.preferredEndLocation,
            item.preferredHotelName,
            item.language,
            item.languagePrice,
            item.preferredCurrency,
            item.preferredPay,
            item.adults,
            item.adultPrice,
            item.children,
            item.childrenPrice,
            item.infants,
            item.infantsPrice,
            item.preferredDriver,
            item.driverTotalPrice,
            item.preferredLunc,
            item.lunchPrice,
            item.itinerary_name,
            item.additionalTickets,
            item.specialRequest,
            newOrderId,
            item.tourtotal,
            date_time,
            date_time,
            date_time,
          ];

          conn.query(
            insertOrderItemsQuery,
            orderItemsValues,
            (error, result) => {
              if (error) {
                console.error(error);
                reject(error); // Reject the promise on error
              } else {
                resolve(result); // Resolve the promise on success
              }
            }
          );
        });
      });

      try {
        await Promise.all(itemsInsertPromises);
        res.status(200).send({
          status: "success",
          msg: "Add to Cart successful",
        });
      } catch (insertError) {
        console.error(insertError);
        return res.status(500).send({ msg: insertError });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};
