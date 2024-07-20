import render from "./render.js";
import serve from "@primate/frontend/common/serve";
import rootname from "./rootname.js";
import set_mode from "./set-mode.js";

export default extension => {
  // todo: base on app mode
  set_mode("production");

  return serve({ rootname, render })(extension);
};
