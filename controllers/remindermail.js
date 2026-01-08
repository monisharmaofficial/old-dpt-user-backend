const cron = require("node-cron");
const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const sendMail = require("../helper/sendMail");
const fs = require("fs/promises");
const ejs = require("ejs");

// Schedule the cron job
exports.remindermail = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Cron job is running!");

      const currentDateWithoutTime = new Date().toISOString().split("T")[0]; // Get current date without time
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
          tourorder.currency,
          tourorder.tax,
          tourorder.sub_total,
          tourorder.discount,
          tourorder.total,
          tourorder.created_at
        FROM orderitems 
        JOIN tourorder ON orderitems.tourorder_id = tourorder.id
        WHERE DATE(orderitems.next_reminder_date) = ?
        AND DATE(orderitems.booking_date) = ?`;

      console.log("SQL Query:", currentDateWithoutTime); // Log the SQL query

      conn.query(
        sqlQuery,
        [currentDateWithoutTime, currentDateWithoutTime],
        async (err, result) => {
          if (err) {
            console.error("Error executing query:", err);
            // Handle the error accordingly
            return;
          }

          //console.log("Query Result:", result); // Log the result object

          if (result && result.length > 0) {
            for (const row of result) {
              const template = await fs.readFile(
                "views/bookingmail.ejs",
                "utf-8"
              );
              console.log(row.tour_image);
              const content = ejs.render(template, {
                tour_image: row.tour_image,
                tour_name: row.tour_name,
                order_id: row.order_id,
                tour_currency: row.tour_currency,
                tourtotal: row.tourtotal,
                first_name: row.first_name,
                nationality: row.nationality,
                email: row.email,
                cell_no: row.cell_no,
                tour_date: row.tour_date,
                pickup_time: row.pickup_time,
                pickup_location: row.pickup_location,
                end_location: row.end_location,
                hotel_name: row.hotel_name,
                language: row.language,
                tour_currency: row.tour_currency,
                payment_mode: row.payment_mode,
                adults: row.adults,
                children: row.children,
                infants: row.infants,
                addition_driver: row.addition_driver,
                additional_lunch: row.additional_lunch,
                itinerary_name: row.itinerary_name,
                special_request: row.special_request,
              });

              let mailSubject = "Your Subject Here";
              let email = row.email;
              // Get the email from the database
              sendMail(email, mailSubject, content);
              //console.log("Email sent to:", email);
              // Calculate next reminder date (subtract 3 days from the current date)
              //const nextReminderDate = new Date(currentDate);
              const date_time = new Date();
              const nextReminderDate = new Date(date_time);
              nextReminderDate.setDate(date_time.getDate() + 3);
              const sqlQuery = `UPDATE orderitems SET next_reminder_date = ?,last_reminder_date = ? WHERE id = ?;`;
              const values = [nextReminderDate, date_time, row.id];
              conn.query(sqlQuery, values, (err, result) => {
                if (err) {
                  console.error("Error executing query:", err);
                } else {
                  console.log("Booking Mail Send ");
                }
              });
            }
          } else {
            console.log("No rows found or unexpected result structure.");
          }
        }
      );
    } catch (err) {
      console.error("Error executing reminder process:", err);
    }
  });
};

exports.bookingMail = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Cron job is running!");

      const currentDateWithoutTime = new Date().toISOString().split("T")[0]; // Get current date without time
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
          tourorder.currency,
          tourorder.tax,
          tourorder.sub_total,
          tourorder.discount,
          tourorder.total,
          tourorder.created_at
        FROM orderitems 
        JOIN tourorder ON orderitems.tourorder_id = tourorder.id
        WHERE DATE(orderitems.next_reminder_date) = ?
        AND DATE(orderitems.booking_date) = ?`;

      console.log("SQL Query:", currentDateWithoutTime); // Log the SQL query

      conn.query(
        sqlQuery,
        [currentDateWithoutTime, currentDateWithoutTime],
        async (err, result) => {
          if (err) {
            console.error("Error executing query:", err);
            // Handle the error accordingly
            return;
          }

          //console.log("Query Result:", result); // Log the result object

          if (result && result.length > 0) {
            for (const row of result) {
              const template = await fs.readFile(
                "views/bookingmail.ejs",
                "utf-8"
              );
              console.log(row.tour_image);
              const content = ejs.render(template, {
                tour_image: row.tour_image,
                tour_name: row.tour_name,
                order_id: row.order_id,
                tour_currency: row.tour_currency,
                tourtotal: row.tourtotal,
                first_name: row.first_name,
                nationality: row.nationality,
                email: row.email,
                cell_no: row.cell_no,
                tour_date: row.tour_date,
                pickup_time: row.pickup_time,
                pickup_location: row.pickup_location,
                end_location: row.end_location,
                hotel_name: row.hotel_name,
                language: row.language,
                tour_currency: row.tour_currency,
                payment_mode: row.payment_mode,
                adults: row.adults,
                children: row.children,
                infants: row.infants,
                addition_driver: row.addition_driver,
                additional_lunch: row.additional_lunch,
                itinerary_name: row.itinerary_name,
                special_request: row.special_request,
              });

              let mailSubject = "Your Subject Here";
              let email = row.email;
              // Get the email from the database
              sendMail(email, mailSubject, content);
              //console.log("Email sent to:", email);
              // Calculate next reminder date (subtract 3 days from the current date)
              //const nextReminderDate = new Date(currentDate);
              const date_time = new Date();
              const nextReminderDate = new Date(date_time);
              nextReminderDate.setDate(date_time.getDate() + 3);
              const sqlQuery = `UPDATE orderitems SET next_reminder_date = ?,last_reminder_date = ? WHERE id = ?;`;
              const values = [nextReminderDate, date_time, row.id];
              conn.query(sqlQuery, values, (err, result) => {
                if (err) {
                  console.error("Error executing query:", err);
                } else {
                  console.log("Booking Mail Send ");
                }
              });
            }
          } else {
            console.log("No rows found or unexpected result structure.");
          }
        }
      );
    } catch (err) {
      console.error("Error executing reminder process:", err);
    }
  });
};
