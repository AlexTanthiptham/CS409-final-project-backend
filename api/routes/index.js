// All app endpoints

module.exports = function (app, router) {
  app.use("/", require("./home.js")(router));

  const usersRouter = require("./users");
  const resumesRouter = require("./resumes");
  const commentsRouter = require("./comments");
  const templatesRouter = require("./templates");

  // Stopgap solution - Fix this later
  app.use("/users", usersRouter);
  app.use("/resumes", resumesRouter);
  app.use("/comments", commentsRouter);
  app.use("/templates", templatesRouter);
};
