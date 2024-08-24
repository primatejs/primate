import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/angular": dependencies["@primate/angular"],
    "@angular/core": dependencies["@angular/core"],
  },
  imports: {
    angular: "@primate/angular",
  },
  modules: {
    angular: "",
  },
});
