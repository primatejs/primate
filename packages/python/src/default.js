import build from "#build";
import default_extension from "#extension";
import name from "#name";

export default ({ extension = default_extension, packages = [] } = {}) => ({
  name,
  build: build({ name, extension, packages }),
});
