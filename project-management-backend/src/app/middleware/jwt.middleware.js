const { UserModel } = require("../modules/user/models/user.model");
const { msg } = require("../../config/message");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const secret = process.env.secret_token;

//User authentication
exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) return res.status(401).send({ error: "Authorization token missing", success: false, status: 401 });

    const token = auth.substr(auth.indexOf(" ") + 1);
    let decoded = jwt.verify(token, secret);

    decoded.id = decoded._id.toString();
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).send({ error: err.message, success: false, status: 401 });
  }
};



