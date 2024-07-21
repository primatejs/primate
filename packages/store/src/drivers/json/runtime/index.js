import serve from "./serve.js";

export default ({ filename }) => ({
  serve: serve(filename),
});
