const db = require("./database");
const helper = require("../helper");
const config = require("../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllPaginated(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT id, name, surname, email, password, user_type_id 
    FROM users LIMIT ?,?`,
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getAll() {
  const rows = await db.query(
    `SELECT id, name, surname, email, password, user_type_id FROM users`
  );
  const data = helper.emptyOrRows(rows);

  return {
    data,
  };
}

async function getByMail(email) {
  const result = await db.query(
    `SELECT id, name, surname, email, password, user_type_id FROM users
        WHERE email = ?`,
    [email]
  );

  if (result != undefined) return { result };
}

async function registerUser(req, res, next) {
  // username min length 3
  if (!req.body.username || req.body.username.length < 3) {
    return res.status(400).send({
      msg: "Please enter a username with min. 3 chars",
    });
  }
  // password min 6 chars
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).send({
      msg: "Please enter a password with min. 6 chars",
    });
  }
  // password (repeat) does not match
  if (
    !req.body.password_repeat ||
    req.body.password != req.body.password_repeat
  ) {
    return res.status(400).send({
      msg: "Both passwords must match",
    });
  }

  const hash = bcrypt.hashSync(req.body.password, 10);

  const result = await db.query(
    `INSERT INTO users 
      (name, surname, email, password)  
      VALUES 
      (?, ?, ?, ?)`,
    [req.body.username, req.body.surname, req.body.email, hash]
  );

  let message = "Error in creating USER";

  if (result.affectedRows) {
    message = "User added!";
  }

  return res.status(200).send({
    msg: message,
  });
}

async function auth(req, res, next) {
  //const user = getByMail(loggedUser.email);
  console.log("usuario auth: ", req.body);
  try {
    //COMPROBACIONES CORREO Y ESCAPE

    const result = await db.query(`SELECT * FROM users WHERE email = ?`, [
      req.body.email,
    ]);

    console.log("usuario auth: ", result);

    if (!result.length) {
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    }

    const isCorrectPass = await bcrypt.compare(
      req.body.password,
      result[0]["password"]
    );

    if (!isCorrectPass) {
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    }

    const token = jwt.sign(
      {
        username: result[0].username,
        userId: result[0].id,
      },
      "SECRETKEY",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).send({
      msg: "Logged in!",
      token,
      user: result[0],
    });
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        msg: err,
      });
    }
  }
}

async function isLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "SECRETKEY");
    req.userData = decoded;
    next();
  } catch (err) {
    return res.status(401).send({
      msg: "Your session is not valid!",
    });
  }
}

module.exports = {
  getAll,
  registerUser,
  auth,
  isLoggedIn,
};
