import depend from "../../../depend.js";

const dependencies = ["surrealdb.js"];

export default name => async () => {
  await depend(dependencies, name);
};
