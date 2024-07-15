import serve from "@primate/frontend/common/serve";
import rootname from "@primate/frontend/handlebars/common/rootname";
import render from "./render.js";

export default serve({ rootname, render });
