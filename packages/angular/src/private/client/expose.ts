export default `
  // side effects
  import "@angular/compiler";
  import "zone.js";

  export {
    bootstrapApplication,
    provideClientHydration,
  } from "@angular/platform-browser";`;
