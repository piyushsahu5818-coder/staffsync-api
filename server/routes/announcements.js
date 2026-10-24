const r = require("express").Router();
const c = require("../controllers/announcementController");
const { verifyJWT, authorize } = require("../middleware/auth");
const { wrap } = require("../middleware/error");
r.use(verifyJWT);
r.get("/", wrap(c.list));
r.post("/", authorize("hr"), wrap(c.create));
r.delete("/:id", authorize("hr"), wrap(c.remove));
module.exports = r;
