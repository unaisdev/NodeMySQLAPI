const express = require("express");
const router = express.Router();
const userFunctions = require("../services/userFunctions");

router.get("/", async function (req, res, next) {
  try {
    const users = await userFunctions.getAll();
    res.json(users);
  } catch (err) {
    console.error(`Could not getAll()`, err.message);
    next(err);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    const registered = await userFunctions.registerUser(req, res, next);
    res.json(registered);
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const user = await userFunctions.auth(req, res, next);
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
});

router.get("/secret-route", async function (req, res, next) {
  try {
    const user = await userFunctions.isLoggedIn(req, res, next);
    console.log(req.userData);
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = router;
