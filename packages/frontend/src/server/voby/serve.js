import serve from "@primate/frontend/common/serve";
import "linkedom-global";
import render from "./render.js";
import rootname from "./rootname.js";

export default serve({ rootname, render });
