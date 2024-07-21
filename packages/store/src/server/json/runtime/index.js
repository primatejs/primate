import serve from "./serve.js";

export default ({ database }) => ({
  serve: serve(database),
});
