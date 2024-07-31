import default_extension from "#voby/extension";
import name from "#voby/name";
import serve from "#voby/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
