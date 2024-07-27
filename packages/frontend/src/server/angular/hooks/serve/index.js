import serve from "@primate/frontend/base/serve";
import set_mode from "./set-mode.js";
import render from "./render.js";

export default async extension => {
  // todo: base on app mode
  set_mode("production");

  return serve({ render })(extension);
};
