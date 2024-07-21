import serve from "./serve.js";

const defaults = {
  filename: ":memory:",
};

export default ({
  filename = defaults.filename,
} = {}) => ({
  serve: serve(filename),
});
