const express = require("express");
const users = require("../controllers/user.controller");

const router = express.Router();

router.route("/")
    .get(users.findAll)
    .post(users.create)
    .delete(users.deleteAll)

router.route("/auth/:name/:email/:password")
    .get(users.authUser)

router.route("/:id")
    .get(users.findOne)
    .put(users.update)
    .delete(users.delete)

module.exports = router;
