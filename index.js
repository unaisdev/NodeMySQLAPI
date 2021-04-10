const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require("./routes/routes");

app.use(bodyParser.json());
var corsOptions = {
  origin: ["http://localhost:19006", "http://mymindapi.herokuapp.com"],
  credentials: false,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/users", userRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });

  return;
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
