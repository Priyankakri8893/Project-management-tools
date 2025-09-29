let express = require("express");
let router = express.Router();
const {
  authenticate,
} = require("../../../middleware/jwt.middleware");
const { UserController } = require("../controllers/user.controller");

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/profile", authenticate, UserController.profile);
router.patch("/update", authenticate, UserController.updateProfile);
router.get("/list", authenticate, UserController.list);
router.delete("/delete", authenticate, UserController.deleteUser);

module.exports = router;