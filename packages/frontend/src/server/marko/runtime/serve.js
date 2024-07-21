import serve from "@primate/frontend/base/serve";
import { rootname } from "@primate/frontend/marko/common";
import render from "./render.js";

export default serve({ rootname, render });
