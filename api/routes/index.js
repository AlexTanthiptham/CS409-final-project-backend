// All app endpoints

module.exports = function (app, router) {
  app.use("/api", require("./home.js")(router));

  const usersRouter = require("./users");
  const resumesRouter = require("./resumes");
  const commentsRouter = require("./comments");
  const templatesRouter = require("./templates");

  // Stopgap solution - Fix this later
  app.use("/api/users", usersRouter);
  app.use("/api/resumes", resumesRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/templates", templatesRouter);
};
