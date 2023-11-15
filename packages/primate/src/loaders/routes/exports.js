import load from "./load.js";

export { default as routes } from "./routes.js";
export const guards = await load("guard");
export const errors = await load("error");
export const layouts = await load("layout");
