const { check } = require("express-validator");

exports.loginUpValidataion = [
  check("email", "Email is required").not().isEmpty(),
  check("password", "Password is required").not().isEmpty(),
];

exports.signUpValidataion = [
  check("first_name", "Name is required").not().isEmpty(),
  check("last_name", "Last Name is required").not().isEmpty(),
  check("email", "Email is required").not().isEmpty().isEmail(),
  check("password", "Password is required").not().isEmpty(),
  check("confirm_password", "Confirm Password is required").not().isEmpty(),
  check("confirm_password", "Passwords do not match").custom(
    (value, { req }) => {
      return value === req.body.password;
    }
  ),
];

exports.forgetPasswordUpValidataion = [
  check("email", "Email is required").isEmail(),
];

exports.cartUpValidataion = [
  check("tour_date", "Tour Date is required").not().isEmpty(),
  check("pickup_time", "Preferred Pickup Time is required").not().isEmpty(),
  check("pickup_location", "Pickup Location is required").not().isEmpty(),
  check("end_location", "End Location is required").not().isEmpty(),
  check("hotel_name", "Hotel Name is required").not().isEmpty(),
  check("language", "Preferred Guide Language is required").not().isEmpty(),
  check("currency", "CurrPref.currencyency is required").not().isEmpty(),
  check("payment_mode", "Payment Mode is required").not().isEmpty(),
  check("adults", "Adults is required").not().isEmpty(),
  check("children", "Children is required").not().isEmpty(),
  check("infants", "Name is required").not().isEmpty(),
  check("addition_driver", "Addition driver is required").not().isEmpty(),
  check("additional_lunch", "Additional lunch is required").not().isEmpty(),
  check("additional_tickets", "Additional tickets is required").not().isEmpty(),
  check("special_request", "Special Request is required").not().isEmpty(),
];
