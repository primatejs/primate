import serve from "./serve.js";

const defaults = {
  database: ":memory:",
};

export default ({
  database = defaults.database,
} = {}) => ({
  serve: serve(database),
});
