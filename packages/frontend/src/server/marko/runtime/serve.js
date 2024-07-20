import serve from "@primate/frontend/common/serve";
import rootname from "@primate/frontend/marko/common/rootname";
import render from "./render.js";

export default serve({ rootname, render });
