import depend from "../../../depend.js";

const dependencies = ["postgres"];

export default name => async () => {
  await depend(dependencies, name);
};
