const User_routes = require("./src/app/modules/user/routes/user.route");
const Project_routes = require("./src/app/modules/project/routes/project.route");
const Task_routes = require("./src/app/modules/task/routes/task.route");

//All modules path and path-handler array
module.exports = [
  {
    path: "/user",
    handler: User_routes,
  },
  {
    path: "/project",
    handler: Project_routes,
  },
  {
    path: "/task",
    handler: Task_routes,
  },
];
