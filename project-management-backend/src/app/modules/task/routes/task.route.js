let express = require("express");
let router = express.Router();
const {
  authenticate,
} = require("../../../middleware/jwt.middleware");
const { TaskController } = require("../controllers/task.controller");

router.get("/:projectId", authenticate, TaskController.getAllTask);
router.get("/", authenticate, TaskController.getTaskById);
router.post("/", authenticate, TaskController.createTask);
router.patch("/:id", authenticate, TaskController.updateTask);
router.delete("/:id", authenticate, TaskController.deleteTask);
router.post("/assign/:id", authenticate, TaskController.assignTask);

module.exports = router;