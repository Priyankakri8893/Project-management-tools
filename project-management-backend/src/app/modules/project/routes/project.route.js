let express = require("express");
let router = express.Router();
const {
    authenticate,
} = require("../../../middleware/jwt.middleware");
const { ProjectController } = require("../controllers/project.controller");

router.get("/", authenticate, ProjectController.getAllProject);
router.get("/:id", authenticate, ProjectController.getProjectById);
router.post("/", authenticate, ProjectController.createProject);
router.patch("/:id", authenticate, ProjectController.updateProject);
router.delete("/:id", authenticate, ProjectController.deleteProject);
router.post("/assign/:id", authenticate, ProjectController.assignProject);

module.exports = router;