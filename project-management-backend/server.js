const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { env } = require("./src/environment/environment");
const routes = require("./route");
const mongoose = require("./src/app/db/mongoose");
const port = process.env.PORT || 8000;
const server = http.createServer(app);
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    return res.status(200).send("server is running");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

//Mapping all modules path and path-handler
routes.map((route) => {
  app.use(route.path, route.handler);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`server is running on port ${port}`);
});

module.exports = { server };
