import serve from "@primate/frontend/base/serve";
import { name } from "@primate/frontend/marko/common";
import render from "./render.js";

export default serve({ name, render });
