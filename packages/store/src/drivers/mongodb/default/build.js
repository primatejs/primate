import depend from "../../../depend.js";

const dependencies = ["mongodb"];

export default name => async () => {
  await depend(dependencies, name);
};
