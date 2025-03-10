import info from "#log/info";
import name from "#name";

export default info(name)(import.meta.url, {
  message: "no {0} route to {1}",
  fix: "create a {0} route function at {2}.js",
});
