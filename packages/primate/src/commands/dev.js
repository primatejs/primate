import build from "./build.js";
import serve from "./serve.js";

// build for development and serve
export default async () => await build("development") && serve();
