import build from "#voby/build";
import default_extension from "#voby/extension";
import name from "#voby/name";
import serve from "#voby/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
