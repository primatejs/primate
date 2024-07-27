import Webview from "@rcompat/webview/worker";
import { desktop } from "./targets/exports.js";

export default ({
  start = "/",
} = {}) => {
  return {
    name: "primate:native",
    init(app, next) {
      ["windows", "linux", "darwin"]
        .forEach(target => app.target(target, desktop));
      return next(app);
    },
    async serve(app, next) {
      if (app.build_target === "desktop") {
        const webview = new Webview();
        const { host, port } = app.get("http");
        webview.navigate(`http://${host}:${port}${start}`);
        webview.run();
        webview.closed(() => {
          app.stop();
        });
      }
      return next(app);
    },
  };
};
