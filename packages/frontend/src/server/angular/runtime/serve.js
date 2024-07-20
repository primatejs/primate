import serve from "@primate/frontend/common/serve";
import render from "./render.js";
import rootname from "@primate/frontend/angular/common/rootname";
import set_mode from "./set-mode.js";

export default extension => {
  // todo: base on app mode
  set_mode("production");

  return serve({ rootname, render })(extension);
};
