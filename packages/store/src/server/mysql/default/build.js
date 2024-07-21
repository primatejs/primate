import depend from "../../../depend.js";

const dependencies = ["mysql2"];

export default name => async () => {
  await depend(dependencies, name);
};
