const express = require("express");
const app = express();
require("./database/database");
const routes = require("./routes/index");
const port = process.env.PORT;

app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
