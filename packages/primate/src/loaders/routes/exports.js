import load from "./load.js";

export { default as routes } from "./routes.js";
export const guards = load("guard");
export const errors = load("error");
export const layouts = load("layouts");
