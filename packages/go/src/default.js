import build from "#build";
import default_extension from "#extension";
import name from "#name";

export default ({ extension = default_extension } = {}) => ({
  name,
  build: build({ extension }),
});
