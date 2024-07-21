import serve from "@primate/frontend/base/serve";
import { name } from "@primate/frontend/voby/common";
import render from "./render.js";

export default serve({ name, render });
