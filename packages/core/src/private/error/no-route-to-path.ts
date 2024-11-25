import { info } from "#error";

export default info(import.meta.url, {
  message: "no {0} route to {1}",
  fix: "create a {0} route function at {2}.js",
});
