import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/angular": dependencies["@primate/angular"],
    "@angular/compiler": dependencies["@angular/compiler"],
    "@angular/core": dependencies["@angular/core"],
    "@angular/platform-server": dependencies["@angular/platform-server"],
    "@angular/platform-client": dependencies["@angular/platform-client"],
    "@angular/ssr": dependencies["@angular/ssr"],
    "zone.js": dependencies["zone.js"],
  },
  imports: {
    angular: "@primate/angular",
  },
  modules: {
    angular: "",
  },
});
