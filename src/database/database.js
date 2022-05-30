const dbURL = process.env.DATABASE_URL;
const mongoose = require("mongoose");

mongoose
  .connect(dbURL)
  .then((client) => {
    console.log("Mongo DB connected!");
  })
  .catch((err) => {
    console.log(err);
  });
