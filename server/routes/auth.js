const r = require("express").Router();
const c = require("../controllers/authController");
const { verifyJWT } = require("../middleware/auth");
const { wrap } = require("../middleware/error");
r.post("/register", wrap(c.register));
r.post("/login", wrap(c.login));
r.get("/me", verifyJWT, c.me);
module.exports = r;
