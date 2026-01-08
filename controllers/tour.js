const AppError = require("../utils/appError");
const { validationResult } = require("express-validator");
require("dotenv").config();
const conn = require("../services/db");
const randomstring = require("randomstring");
const sendMail = require("../helper/sendMail");

// Catgory List =============

exports.desert_Safari_cat_list = (req, res) => {
  const cat_id = req.params.category_id;
  const query = `
  SELECT
    t.*,
    c.categories_name,
    c.categories_id,
    d.destinationname,
    d.destinationid,
    e.emirates_name,
    e.emirates_id,
    e.emirates_image,
    i.itinerary_name,
    i.itinerary_id,
    i.itinerary_description,
    i.itinerary_image
  FROM tours t
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(c.name) AS categories_name,
      GROUP_CONCAT(c.id) AS categories_id
    FROM tours t
    LEFT JOIN categories c ON FIND_IN_SET(c.id, t.category_id)
    GROUP BY t.id
  ) c ON t.id = c.tour_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(d.destination_name) AS destinationname,
      GROUP_CONCAT(d.id) AS destinationid
    FROM tours t
    LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
    GROUP BY t.id
  ) d ON t.id = d.tour_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(e.name) AS emirates_name,
      GROUP_CONCAT(e.id) AS emirates_id,
      GROUP_CONCAT(e.image) AS emirates_image
    FROM tours t
    LEFT JOIN emirates e ON FIND_IN_SET(e.id, t.emirates_id)
    GROUP BY t.id
  ) e ON t.id = e.tour_id
  WHERE t.category_id = ? AND t.status = 1;`;

  conn.query(query, cat_id, (error, results) => {
    if (error) {
      res.status(500).send({
        status: "error",
        msg: "Internal Server Error",
        error: error.message,
      });
    } else {
      //console.log(results);
      const tours = results.map((row) => ({
        id: row.id,
        tour_name: row.tour_name,
        slug: row.slug,
        category_slug: row.category_slug,
        hastag: row.hastag,
        discount: row.discount,
        no_of_pax: row.no_of_pax,
        intro: row.intro,
        tour_details: row.tour_details,
        question: row.question,
        useful: row.useful,
        mail_body: row.mail_body,
        included: row.included,
        exclusive: row.exclusive,
        expect: row.expect,
        policy: row.policy,
        know: row.know,
        asked_questions: row.asked_questions,
        tour_price_aed: row.tour_price_aed,
        tour_price_usd: row.tour_price_usd,
        tour_duration: row.tour_duration,
        image: row.image,
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        meta_keywords: row.meta_keywords,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category_info: row.categories_id
          ? row.categories_id.split(",").map((category_Id, index) => ({
              id: category_Id,
              name: row.categories_name.split(",")[index],
            }))
          : [],
        destination_info: row.destinationid
          ? row.destinationid.split(",").map((destination_Id, index) => ({
              id: destination_Id,
              name: row.destinationname.split(",")[index],
            }))
          : [],
        emirates_info: row.emirates_id
          ? row.emirates_id.split(",").map((emirates_Id, index) => ({
              id: emirates_Id,
              name: row.emirates_name.split(",")[index],
              image: row.emirates_image.split(",")[index],
            }))
          : [],
        sticker_info: row.sticker
          ? row.sticker.split(",").map((stickerId, index) => ({
              id: stickerId,
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};
// Poplur Toure
exports.popular_tours = (req, res) => {
  const popular_tours = 1;
  const query = `
    SELECT
      t.*,
      d.destinationid,
      d.destinationname /* Removed the comma after this line */
    FROM tours t
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(d.destination_name) AS destinationname,
        GROUP_CONCAT(d.id) AS destinationid
      FROM tours t
      LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
      GROUP BY t.id
    ) d ON t.id = d.tour_id
    WHERE t.popular_tours = ? AND t.status = 1; 
  `;

  conn.query(query, popular_tours, (error, results) => {
    if (error) {
      res.status(500).send({
        status: "error",
        msg: "Internal Server Error",
        error: error.message,
      });
    } else {
      // console.log(results);
      const tours = results.map((row) => ({
        id: row.id,
        tour_name: row.tour_name,
        slug: row.slug,
        category_slug: row.category_slug,
        hastag: row.hastag, // Corrected field name from 'hastag' to 'hashtag'
        discount: row.discount,
        no_of_pax: row.no_of_pax,
        intro: row.intro,
        tour_price_aed: row.tour_price_aed,
        tour_price_usd: row.tour_price_usd,
        tour_duration: row.tour_duration,
        image: row.image,
        destination_info: row.destinationid
          ? row.destinationid.split(",").map((destination_Id, index) => ({
              id: destination_Id,
              name: row.destinationname.split(",")[index],
            }))
          : [],
        sticker_info: row.sticker
          ? row.sticker.split(",").map((stickerId, index) => ({
              id: stickerId,
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results.length,
        data: tours,
      });
    }
  });
};

// destanition =============
exports.destanition_list = (req, res) => {
  //let sqlQuery = "SELECT  FROM  destination ";
  const sqlQuery = `
    SELECT
      d.id,
      d.destination_name,
      d.image,
      d.slug
    FROM destination d
    WHERE d.status = 1`;

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

// destanition =============
exports.categories_list = (req, res) => {
  const sqlQuery = `
    SELECT
      c.name,
      c.slug
    FROM categories c
    WHERE c.status = 1`;

  conn.query(sqlQuery, (err, result) => {
    if (err) {
      //console.error("Error executing query:", err);
      return res.status(500).send({
        status: "error",
        message: "Database error occurred",
        error: err.message, // Sending the error message for debugging purposes
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

//popular-tours =============
exports.desert_Safari = (req, res) => {
  const slug = req.params.category_id;
  const query = `
  SELECT
    t.*,
    d.destinationid,
    d.destinationname
  FROM tours t
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(d.destination_name) AS destinationname,
      GROUP_CONCAT(d.id) AS destinationid
    FROM tours t
    LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
    GROUP BY t.id
  ) d ON t.id = d.tour_id
  WHERE t.category_slug = ? AND t.status = 1
`;

  conn.query(query, slug, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      const tours = results.map((row) => ({
        id: row.id,
        tour_name: row.tour_name,
        slug: row.slug,
        hastag: row.hastag,
        discount: row.discount,
        no_of_pax: row.no_of_pax,
        intro: row.intro,
        tour_price_aed: row.tour_price_aed,
        tour_price_usd: row.tour_price_usd,
        tour_duration: row.tour_duration,
        image: row.image,
        destination_info: row.destinationid
          ? row.destinationid.split(",").map((destination_Id, index) => ({
              id: destination_Id,
              name: row.destinationname.split(",")[index],
            }))
          : [],
        sticker_info: row.sticker
          ? row.sticker.split(",").map((stickerId, index) => ({
              id: stickerId,
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

// etarni ==================
exports.emirates_list = (req, res) => {
  let sqlQuery = "SELECT * FROM emirates WHERE status = 1";

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
// cat list end ============
exports.get = (req, res) => {
  const query = `
    SELECT
      t.id,
      t.sticker,
      t.tour_name,
      t.intro,
      t.image,
      t.hastag,
      t.discount,
      t.tour_price_aed,
      t.tour_price_usd,
      t.tour_duration,
      t.no_of_pax,
      t.slug,
      d.destinationid,
      d.destinationname
    FROM tours t
    LEFT JOIN (
      SELECT
        t.id AS tour_id,
        GROUP_CONCAT(d.destination_name) AS destinationname,
        GROUP_CONCAT(d.id) AS destinationid
      FROM tours t
      LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
      GROUP BY t.id
    ) d ON t.id = d.tour_id
    WHERE t.status = 1`; // Adding the condition here

  conn.query(query, (error, results) => {
    if (error) {
      // console.error(error);
      res.status(500).send({
        status: "error",
        message: "An error occurred while fetching data.",
        error: error.message, // Adjust the error handling as per your requirements
      });
    } else {
      //  console.log(results);
      const tours = results.map((row) => ({
        id: row.id,
        tour_name: row.tour_name,
        slug: row.slug,
        hastag: row.hastag,
        discount: row.discount,
        no_of_pax: row.no_of_pax,
        intro: row.intro,
        tour_price_aed: row.tour_price_aed,
        tour_price_usd: row.tour_price_usd,
        tour_duration: row.tour_duration,
        image: row.image,
        destination_info: row.destinationid
          ? row.destinationid.split(",").map((destination_Id, index) => ({
              id: destination_Id,
              name: row.destinationname.split(",")[index],
            }))
          : [],
        sticker_info: row.sticker
          ? row.sticker.split(",").map((stickerId, index) => ({
              id: stickerId,
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

exports.tour_detail = (req, res) => {
  const slug = req.params.slug;
  const query = `
  SELECT
    t.*,
    c.categories_name,
    c.categories_id,
    d.destinationid,
    d.destinationname,
    e.emirates_name,
    e.emirates_id,
    e.emirates_image,
    i.itinerary_name,
    i.itinerary_id,
    i.itinerary_description,
    i.itinerary_image,
    i.emirates_ticket_price_aed,
    i.emirates_ticket_price_usd
  FROM tours t
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(c.name) AS categories_name,
      GROUP_CONCAT(c.id) AS categories_id
    FROM tours t
    LEFT JOIN categories c ON FIND_IN_SET(c.id, t.category_id)
    GROUP BY t.id
  ) c ON t.id = c.tour_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(d.destination_name) AS destinationname,
      GROUP_CONCAT(d.id) AS destinationid
    FROM tours t
    LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
    GROUP BY t.id
  ) d ON t.id = d.tour_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(e.name) AS emirates_name,
      GROUP_CONCAT(e.id) AS emirates_id,
      GROUP_CONCAT(e.image) AS emirates_image
    FROM tours t
    LEFT JOIN emirates e ON FIND_IN_SET(e.id, t.emirates_id)
    GROUP BY t.id
  ) e ON t.id = e.tour_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(i.itinerary_name) AS itinerary_name,
      GROUP_CONCAT(i.id) AS itinerary_id,
      GROUP_CONCAT(i.itinerary_description) AS itinerary_description,
      GROUP_CONCAT(i.image) AS itinerary_image,
      GROUP_CONCAT(i.ticket_price_aed) AS emirates_ticket_price_aed,
      GROUP_CONCAT(i.ticket_price_usd) AS emirates_ticket_price_usd
    FROM tours t
    LEFT JOIN itinerary i ON FIND_IN_SET(i.id, t.itinerary_id)
    WHERE i.status = 1  -- Add a condition to filter by itinerary status
    GROUP BY t.id
  ) i ON t.id = i.tour_id
  WHERE t.slug = ?;  -- Replace 123 with the desired tour ID
`;

  conn.query(query, [slug], (error, results) => {
    if (error) {
      // console.error(error);
      return res.status(500).send({
        msg: error,
      });
    } else {
      //console.log(results);
      const tours = results.map((row) => ({
        id: row.id,
        tour_name: row.tour_name,
        slug: row.slug,
        category_slug: row.category_slug,
        hastag: row.hastag,
        discount: row.discount,
        intro: row.intro,
        tour_details: row.tour_details,
        no_of_pax: row.no_of_pax,
        additional_charges_info: row.additional_charges_info,
        question: row.question,
        useful: row.useful,
        mail_body: row.mail_body,
        included: row.included,
        exclusive: row.exclusive,
        expect: row.expect,
        policy: row.policy,
        know: row.know,
        asked_questions: row.asked_questions,
        tour_price_aed: row.tour_price_aed,
        tour_price_usd: row.tour_price_usd,
        tour_duration: row.tour_duration,
        language: row.language,
        image: row.image,
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        meta_keywords: row.meta_keywords,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category_info: row.categories_id
          ? row.categories_id.split(",").map((category_Id, index) => ({
              id: category_Id,
              name: row.categories_name.split(",")[index],
            }))
          : [],
        destination_info: row.destinationid
          ? row.destinationid.split(",").map((destination_Id, index) => ({
              id: destination_Id,
              name: row.destinationname.split(",")[index],
            }))
          : [],
        sticker_info: row.sticker
          ? row.sticker.split(",").map((stickerId, index) => ({
              id: stickerId,
            }))
          : [],
        emirates_info: row.emirates_id
          ? row.emirates_id.split(",").map((emirates_Id, index) => ({
              id: emirates_Id,
              name: row.emirates_name.split(",")[index],
              image: row.emirates_image.split(",")[index],
            }))
          : [],
        itinerary_info: row.itinerary_id
          ? row.itinerary_id.split(",").map((itinerary_Id, index) => ({
              id: itinerary_Id,
              name: row.itinerary_name.split(",")[index],
              itinerary_ticket_price_aed:
                row.emirates_ticket_price_aed.split(",")[index],
              itinerary_ticket_price_usd:
                row.emirates_ticket_price_usd.split(",")[index],
              description: row.itinerary_description.split(",")[index],
              image: row.itinerary_image.split(",")[index],
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

exports.category_tours = (req, res) => {
  const slug = req.params.slug;
  const query = `
    SELECT
      c.*,
      c.id AS c_id,
      d.destinationid,
      d.destinationname,
      t.tour_id,
      t.tour_sticker,
      t.tour_destination_id,
      t.tour_name,
      t.tour_intro,
      t.tour_image,
      t.tour_hastag,
      t.tour_discount,
      t.tour_tour_price_aed,
      t.tour_tour_price_usd,
      t.tour_tour_duration,
      t.tour_no_of_pax,
      t.tour_slug
    FROM categories c
    LEFT JOIN (
      SELECT c.id AS c_id,
       GROUP_CONCAT(t.id) AS tour_id,
        GROUP_CONCAT(t.destination_id) AS tour_destination_id,
        GROUP_CONCAT(t.tour_name) AS tour_name,
        GROUP_CONCAT(t.sticker) AS tour_sticker,
        GROUP_CONCAT(t.intro) AS tour_intro,
        GROUP_CONCAT(t.image) AS tour_image,
        GROUP_CONCAT(t.tour_price_aed) AS tour_tour_price_aed,
        GROUP_CONCAT(t.tour_price_usd) AS tour_tour_price_usd,
        GROUP_CONCAT(t.tour_duration) AS tour_tour_duration,
        GROUP_CONCAT(t.hastag) AS tour_hastag,
        GROUP_CONCAT(t.discount) AS tour_discount,
        GROUP_CONCAT(t.no_of_pax) AS tour_no_of_pax,
        GROUP_CONCAT(t.slug) AS tour_slug
      FROM categories c
      LEFT JOIN tours t ON FIND_IN_SET(c.id, t.category_id)
      WHERE t.status = 1  /* Adding condition here */
      GROUP BY c.id
    ) t ON c.id = t.c_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(d.destination_name) AS destinationname,
        GROUP_CONCAT(d.id) AS destinationid
      FROM tours t
      LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
      GROUP BY t.id
    ) d ON t.tour_id = d.tour_id
    WHERE c.slug = ?;`;

  conn.query(query, [slug], (error, results) => {
    if (error) {
      // console.error(error);
      res.status(500).send({
        status: "error",
        msg: "Internal Server Error",
        error: error.message,
      });
    } else {
      const tours = results.map((row) => ({
        id: row.c_id,
        name: row.name,
        slug: row.slug,
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        meta_keywords: row.meta_keywords,
        short_description: row.short_description,
        description: row.description,
        image: row.image,
        tour_info: row.tour_name
          ? row.tour_name.split(",").map((Tour_name, index) => ({
              Tour_name: Tour_name,
              tour_id: row.tour_id && row.tour_id.split(",")[index],
              tour_slug: row.tour_slug && row.tour_slug.split(",")[index],
              tour_intro: row.tour_intro && row.tour_intro.split(",")[index],
              tour_image: row.tour_image && row.tour_image.split(",")[index],
              tour_hastag: row.tour_hastag && row.tour_hastag.split(",")[index],
              tour_discount:
                row.tour_discount && row.tour_discount.split(",")[index],
              tour_no_of_pax:
                row.tour_no_of_pax && row.tour_no_of_pax.split(",")[index],
              tour_tour_price_aed:
                row.tour_tour_price_aed &&
                row.tour_tour_price_aed.split(",")[index],
              tour_tour_price_usd:
                row.tour_tour_price_usd &&
                row.tour_tour_price_usd.split(",")[index],
              tour_tour_duration:
                row.tour_tour_duration &&
                row.tour_tour_duration.split(",")[index],
              destination_info: row.destinationid
                ? row.destinationid.split(",").map((destination_Id, index) => ({
                    id: destination_Id,
                    name: row.destinationname.split(",")[index],
                  }))
                : [],
              sticker_info: row.tour_sticker
                ? row.tour_sticker.split(",").map((stickerId, index) => ({
                    id: stickerId,
                  }))
                : [],
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

exports.destination_tours = (req, res) => {
  const slug = req.params.slug;
  const query = `
  SELECT
    d.*,
    d1.destination_name,
    d1.destination_id,
    t.tour_id,
    t.tour_sticker,
    t.tour_destination_id,
    t.tour_name,
    t.tour_intro,
    t.tour_image,
    t.tour_hastag,
    t.tour_discount,
    t.tour_tour_price_aed,
    t.tour_tour_price_usd,
    t.tour_tour_duration,
    t.tour_no_of_pax,
    t.tour_slug
  FROM destination d
  LEFT JOIN (
    SELECT d.id AS d_id,
      GROUP_CONCAT(t.id) AS tour_id,
      GROUP_CONCAT(t.destination_id) AS tour_destination_id,
      GROUP_CONCAT(t.tour_name) AS tour_name,
      GROUP_CONCAT(t.sticker) AS tour_sticker,
      GROUP_CONCAT(t.intro) AS tour_intro,
      GROUP_CONCAT(t.image) AS tour_image,
      GROUP_CONCAT(t.tour_price_aed) AS tour_tour_price_aed,
      GROUP_CONCAT(t.tour_price_usd) AS tour_tour_price_usd,
      GROUP_CONCAT(t.tour_duration) AS tour_tour_duration,
      GROUP_CONCAT(t.hastag) AS tour_hastag,
      GROUP_CONCAT(t.discount) AS tour_discount,
      GROUP_CONCAT(t.no_of_pax) AS tour_no_of_pax,
      GROUP_CONCAT(t.slug) AS tour_slug
    FROM destination d
    LEFT JOIN tours t ON FIND_IN_SET(d.id, t.destination_id)
    WHERE t.status = 1  /* Adding condition here */
    GROUP BY d.id
  ) t ON d.id = t.d_id
  LEFT JOIN (
    SELECT t.id AS tour_id,
      GROUP_CONCAT(d1.destination_name) AS destination_name,
      GROUP_CONCAT(d1.id) AS destination_id
    FROM tours t
    LEFT JOIN destination d1 ON FIND_IN_SET(d1.id, t.destination_id)
    GROUP BY t.id
  ) d1 ON t.tour_id = d1.tour_id
  WHERE d.slug = ?`;

  conn.query(query, [slug], (error, results) => {
    if (error) {
      //console.error(error);
      res.status(500).send({
        status: "error",
        msg: "Internal Server Error",
        error: error.message,
      });
    } else {
      const tours = results.map((row) => ({
        id: row.id,
        name: row.destination_name,
        description: row.destination_description,
        image: row.image,
        tour_info: row.tour_name
          ? row.tour_name.split(",").map((Tour_name, index) => ({
              Tour_name: Tour_name,
              tour_id: row.tour_id && row.tour_id.split(",")[index],
              tour_slug: row.tour_slug && row.tour_slug.split(",")[index],
              tour_intro: row.tour_intro && row.tour_intro.split(",")[index],
              tour_image: row.tour_image && row.tour_image.split(",")[index],
              tour_hastag: row.tour_hastag && row.tour_hastag.split(",")[index],
              tour_discount:
                row.tour_discount && row.tour_discount.split(",")[index],
              tour_no_of_pax:
                row.tour_no_of_pax && row.tour_no_of_pax.split(",")[index],
              tour_tour_price_aed:
                row.tour_tour_price_aed &&
                row.tour_tour_price_aed.split(",")[index],
              tour_tour_price_usd:
                row.tour_tour_price_usd &&
                row.tour_tour_price_usd.split(",")[index],
              tour_tour_duration:
                row.tour_tour_duration &&
                row.tour_tour_duration.split(",")[index],
              destination_info: row.destination_id
                ? row.destination_id
                    .split(",")
                    .map((destination_Id, index) => ({
                      id: destination_Id,
                      name: row.destination_name.split(",")[index],
                    }))
                : [],
              sticker_info: row.tour_sticker
                ? row.tour_sticker.split(",").map((stickerId, index) => ({
                    id: stickerId,
                  }))
                : [],
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

//

exports.emirates_tours = (req, res) => {
  const slug = req.params.slug;
  const query = `
    SELECT
      e.*,
      e1.emirates_id,
      e1.emirates_name,
      e1.emirates_slug,
      t.tour_id,
      d1.destination_name,
      d1.destination_id,
      t.tour_sticker,
      t.tour_destination_id,
      t.tour_name,
      t.tour_intro,
      t.tour_image,
      t.tour_hastag,
      t.tour_discount,
      t.tour_tour_price_aed,
      t.tour_tour_price_usd,
      t.tour_tour_duration,
      t.tour_no_of_pax,
      t.tour_slug
    FROM emirates e
    LEFT JOIN (
      SELECT e.id AS e_id,
        GROUP_CONCAT(t.id) AS tour_id,
        GROUP_CONCAT(t.destination_id) AS tour_destination_id,
        GROUP_CONCAT(t.tour_name) AS tour_name,
        GROUP_CONCAT(t.sticker) AS tour_sticker,
        GROUP_CONCAT(t.intro) AS tour_intro,
        GROUP_CONCAT(t.image) AS tour_image,
        GROUP_CONCAT(t.tour_price_aed) AS tour_tour_price_aed,
        GROUP_CONCAT(t.tour_price_usd) AS tour_tour_price_usd,
        GROUP_CONCAT(t.tour_duration) AS tour_tour_duration,
        GROUP_CONCAT(t.hastag) AS tour_hastag,
        GROUP_CONCAT(t.discount) AS tour_discount, 
        GROUP_CONCAT(t.no_of_pax) AS tour_no_of_pax,
        GROUP_CONCAT(t.slug) AS tour_slug
      FROM emirates e
      LEFT JOIN tours t ON FIND_IN_SET(e.id, t.emirates_id)
      WHERE t.status = 1
      GROUP BY e.id
    ) t ON e.id = t.e_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(d1.destination_name) AS destination_name,
        GROUP_CONCAT(d1.id) AS destination_id
      FROM tours t
      LEFT JOIN destination d1 ON FIND_IN_SET(d1.id, t.destination_id)
      GROUP BY t.id
    ) d1 ON t.tour_id = d1.tour_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(e1.name) AS emirates_name,
        GROUP_CONCAT(e1.slug) AS emirates_slug,
        GROUP_CONCAT(e1.id) AS emirates_id
      FROM tours t
      LEFT JOIN emirates e1 ON FIND_IN_SET(e1.id, t.emirates_id)
      GROUP BY t.id
    ) e1 ON t.tour_id = e1.tour_id
    WHERE e.slug = ?
  `;

  conn.query(query, [slug], (error, results) => {
    if (error) {
      //console.error(error);
      res.status(500).send({
        status: "error",
        msg: "Internal Server Error",
        error: error.message,
      });
    } else {
      const tours = results.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.slug,
        image: row.image,
        tour_info: row.tour_name
          ? row.tour_name.split(",").map((Tour_name, index) => ({
              Tour_name: Tour_name,
              tour_id: row.tour_id && row.tour_id.split(",")[index],
              tour_slug: row.tour_slug && row.tour_slug.split(",")[index],
              tour_intro: row.tour_intro && row.tour_intro.split(",")[index],
              tour_image: row.tour_image && row.tour_image.split(",")[index],
              tour_hastag: row.tour_hastag && row.tour_hastag.split(",")[index],
              tour_discount:
                row.tour_discount && row.tour_discount.split(",")[index],
              tour_no_of_pax:
                row.tour_no_of_pax && row.tour_no_of_pax.split(",")[index],
              tour_tour_price_aed:
                row.tour_tour_price_aed &&
                row.tour_tour_price_aed.split(",")[index],
              tour_tour_price_usd:
                row.tour_tour_price_usd &&
                row.tour_tour_price_usd.split(",")[index],
              tour_tour_duration:
                row.tour_tour_duration &&
                row.tour_tour_duration.split(",")[index],
              emirates_info: row.emirates_id
                ? row.emirates_id.split(",").map((emirates_Id, index) => ({
                    id: emirates_Id,
                    name: row.emirates_name.split(",")[index],
                  }))
                : [],
              destination_info: row.destination_id
                ? row.destination_id
                    .split(",")
                    .map((destination_Id, index) => ({
                      id: destination_Id,
                      name: row.destination_name.split(",")[index],
                    }))
                : [],
              sticker_info: row.tour_sticker
                ? row.tour_sticker.split(",").map((stickerId, index) => ({
                    id: stickerId,
                  }))
                : [],
            }))
          : [],
      }));

      res.status(200).send({
        status: "success",
        length: results?.length,
        data: tours,
      });
    }
  });
};

exports.search = (req, res) => {
  const searchText = req.body.search; // Assuming the search text is provided in the query parameter

  const query = `
    SELECT
      t.*,
      c.categories_name,
      c.categories_id,
      d.destinationid,
      d.destinationname,
      e.emirates_name,
      e.emirates_id,
      e.emirates_image,
      i.itinerary_name,
      i.itinerary_id,
      i.itinerary_description,
      i.itinerary_image
    FROM tours t
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(c.name) AS categories_name,
        GROUP_CONCAT(c.id) AS categories_id
      FROM tours t
      LEFT JOIN categories c ON FIND_IN_SET(c.id, t.category_id)
      GROUP BY t.id
    ) c ON t.id = c.tour_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(d.destination_name) AS destinationname,
        GROUP_CONCAT(d.id) AS destinationid
      FROM tours t
      LEFT JOIN destination d ON FIND_IN_SET(d.id, t.destination_id)
      GROUP BY t.id
    ) d ON t.id = d.tour_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(e.name) AS emirates_name,
        GROUP_CONCAT(e.id) AS emirates_id,
        GROUP_CONCAT(e.image) AS emirates_image
      FROM tours t
      LEFT JOIN emirates e ON FIND_IN_SET(e.id, t.emirates_id)
      GROUP BY t.id
    ) e ON t.id = e.tour_id
    LEFT JOIN (
      SELECT t.id AS tour_id,
        GROUP_CONCAT(i.itinerary_name) AS itinerary_name,
        GROUP_CONCAT(i.id) AS itinerary_id,
        GROUP_CONCAT(i.itinerary_description) AS itinerary_description,
        GROUP_CONCAT(i.image) AS itinerary_image
      FROM tours t
      LEFT JOIN itinerary i ON FIND_IN_SET(i.id, t.itinerary_id)
      GROUP BY t.id
    ) i ON t.id = i.tour_id
    WHERE t.tour_name LIKE ? OR t.intro LIKE ?
      OR c.categories_name LIKE ? OR e.emirates_name LIKE ?
      OR d.destinationname LIKE ?
  `;

  conn.query(
    query,
    [
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
    ],
    (error, results) => {
      if (error) {
        res.status(500).send({
          status: "error",
          msg: "Internal Server Error",
          error: error.message,
        });
      } else {
        //console.log(results);
        const tours = results.map((row) => ({
          id: row.id,
          tour_name: row.tour_name,
          slug: row.slug,
          category_slug: row.category_slug,
          hastag: row.hastag,
          discount: row.discount,
          no_of_pax: row.no_of_pax,
          intro: row.intro,
          tour_details: row.tour_details,
          question: row.question,
          useful: row.useful,
          mail_body: row.mail_body,
          included: row.included,
          exclusive: row.exclusive,
          expect: row.expect,
          policy: row.policy,
          know: row.know,
          asked_questions: row.asked_questions,
          tour_price_aed: row.tour_price_aed,
          tour_price_usd: row.tour_price_usd,
          tour_duration: row.tour_duration,
          image: row.image,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          meta_keywords: row.meta_keywords,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          category_info: row.categories_id
            ? row.categories_id.split(",").map((category_Id, index) => ({
                id: category_Id,
                name: row.categories_name.split(",")[index],
              }))
            : [],
          destination_info: row.destinationid
            ? row.destinationid.split(",").map((destination_Id, index) => ({
                id: destination_Id,
                name: row.destinationname.split(",")[index],
              }))
            : [],
          sticker_info: row.sticker
            ? row.sticker.split(",").map((stickerId, index) => ({
                id: stickerId,
              }))
            : [],
          emirates_info: row.emirates_id
            ? row.emirates_id.split(",").map((emirates_Id, index) => ({
                id: emirates_Id,
                name: row.emirates_name.split(",")[index],
                image: row.emirates_image.split(",")[index],
              }))
            : [],
          itinerary_info: row.itinerary_id
            ? row.itinerary_id.split(",").map((itinerary_Id, index) => ({
                id: itinerary_Id,
                name: row.itinerary_name.split(",")[index],
                description: row.itinerary_description.split(",")[index],
                image: row.itinerary_image.split(",")[index],
              }))
            : [],
        }));

        res.status(200).send({
          status: "success",
          length: results?.length,
          data: tours,
        });
      }
    }
  );
};
exports.searchlist = (req, res) => {
  let sqlQuery =
    "SELECT tour_name FROM tours WHERE destination_id=" + req.params.id;
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
