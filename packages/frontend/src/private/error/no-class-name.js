import { error } from "#error";
import name from "#name";

export default error({
  message: "the component at {0} is missing a class name",
  fix: "add a class name to the component",
  module: `${name}/webc`,
});
