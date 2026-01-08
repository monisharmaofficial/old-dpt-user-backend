const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/user");
const fileController = require("../controllers/file.controller");
const tour = require("../controllers/tour");
const testimonial = require("../controllers/testimonial");
const faq = require("../controllers/faq");
const attraction = require("../controllers/attraction");
const cart = require("../controllers/cart");
const booking = require("../controllers/booking");
const ask = require("../controllers/ask");
const review = require("../controllers/review");
const language = require("../controllers/language");
const touristvisa = require("../controllers/touristvisa");
const countries = require("../controllers/countries");
const {
  loginUpValidataion,
  signUpValidataion,
  forgetPasswordUpValidataion,
} = require("../helper/validation");
//   Destinationnew Route =================
router.get("/destinationnew-countery-list", countries.countery);
router.post("/destinationnew-state-list/", countries.state_1);
router.post("/destinationnew-name-list/", countries.state_2);
// User Auth route
router.post("/register", signUpValidataion, userController.register);
router.post("/login", loginUpValidataion, userController.getUserLogin);
router.get("/welcome", auth.verifyToken, userController.welcome);
router.post("/profile/update", auth.verifyToken, userController.update_profile);
router.post(
  "/profile/change-password",
  auth.verifyToken,
  userController.update_password
);
router.post("/check/user-email", userController.checkuser);
router.post(
  "/forget-password",
  forgetPasswordUpValidataion,
  userController.forget_password
);
router.post("/reset-password", userController.reset_password_update);

router.post("/logout", userController.logout);

/* Tour Route */
router.get("/tour-list", tour.get);
router.get("/:slug", tour.tour_detail);

/* Cat tour list Route */

router.get("/cat/:category_id", tour.desert_Safari);

/* destanition tour list Route */
router.get("/destanition/list", tour.destanition_list);

/* populartours tour list Route */
router.get("/populartours/list", tour.popular_tours);

/* emirates  list Route */
router.get("/emirates/list", tour.emirates_list);

/* emirates  list Route */
router.post("/search", tour.search);

router.get("/language/list", language.get);

/* testimonial  list Route */
router.get("/testimonial/list", testimonial.get);

/* Cat tour list Route */
router.get("/plan/:slug", tour.category_tours);
router.get("/destination/:slug", tour.destination_tours);

router.get("/destination/search-list/:id", tour.searchlist);

/* Cat tour list Route */
router.get("/emirates/:slug", tour.emirates_tours);

// FAQ list
router.get("/faq/list", faq.get);

/* attraction list Route */
router.get("/popular-attraction/list", attraction.get);
router.get("/popular-attraction/:slug", attraction.edit);

// ================================

router.get("/categories/cat-list", tour.categories_list);
// Boking Url
router.post("/cart/add", cart.add_to_cart);
router.get("/order/list", auth.verifyToken, booking.get_order);
router.get("/booking/list/:tourorder_id", auth.verifyToken, booking.get);
router.get("/booking/:id", auth.verifyToken, booking.booking_detail);
router.get("/hotal/list", booking.getHotelsByStatus);
router.get("/booking/latest/orders", auth.verifyToken, booking.getLatestOrders);
router.get("/booking/cancele/orders", auth.verifyToken, booking.getcanclOrders);

// Review route
router.get("/review/get", auth.verifyToken, review.get);
router.post("/review/add/:id", auth.verifyToken, review.register);
router.get("/review/edit/:id", auth.verifyToken, review.edit);
router.put("/review/update/:id", auth.verifyToken, review.update);
router.get("/tour/review/list/:id", review.tour_review_list);

//wishlist
router.post("/wishlist/add", cart.add_wishlist);
router.get("/wishlist/count", cart.wishlist_count);
router.get("/wishlist/detail", cart.wishlist_detail_list);
router.delete("/wishlist/delete/:id", cart.delete);

//ask

router.post("/ask/add", ask.register);

//tourist-visa
router.post("/tourist-visa/add", touristvisa.register);

/* files upload/download Route */
router.post("/upload", fileController.upload);
router.get("/files", fileController.getListFiles);
router.get("/files/:name", fileController.download);
router.delete("/files/:name", fileController.remove);

module.exports = router; // export to use in server.js
