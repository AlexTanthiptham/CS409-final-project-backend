/*
 * You generally want to .gitignore this file to prevent important credentials from being stored on your public repo.
 */
module.exports = {
  token: "secret-starter-mern",
  // mongo_connection : "mongodb+srv://AlexT:1234@mp3.wgfnqgb.mongodb.net/mp3_data?retryWrites=true&w=majority"
  // mongo_connection : "mongodb+srv://AlexT:1234@mp3.wgfnqgb.mongodb.net/debug?retryWrites=true&w=majority"
  mongo_connection:
    "mongodb+srv://freeref:112233445566@final.vv2vlz3.mongodb.net/?retryWrites=true&w=majority",
  //example: mongo_connection : "mongodb+srv://[type-yours]:[type-yours]@[type-yours-web-provided].mongodb.net/test?retryWrites=true"
};
