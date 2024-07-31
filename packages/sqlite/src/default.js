import defaults from "#defaults";
import serve from "#serve";

export default ({
  database = defaults.database,
} = {}) => ({
  serve: serve({ database }),
});
