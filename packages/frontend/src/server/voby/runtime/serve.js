import serve from "@primate/frontend/base/serve";
import { rootname } from "@primate/frontend/voby/common";
import render from "./render.js";

export default serve({ rootname, render });
