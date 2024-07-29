import dim from "@rcompat/cli/color/dim";
import execute from "@rcompat/stdio/execute";
import desktop from "./desktop.js";
import targets from "./targets.js";

const command = "bun build build/serve.js --conditions=runtime --compile --minify";

export default ({
  start = "/",
} = {}) => {
  return {
    name: "primate:native",
    init(app, next) {
      Object.keys(targets).forEach(target => app.target(target, desktop));
      return next(app);
    },
    build(app, next) {
      if (app.build_target === "desktop") {
        app.done(async () => {
          const { flags, exe } = targets[app.build_target];
          const executable_path = dim(`${app.path.build}/${exe}`);
          await execute(`${command} ${flags} --outfile build/${exe}`);
          app.log.system(`executable written to ${executable_path}`);
        });
      }
      return next(app);
    },
    async serve(app, next) {
      if (app.build_target === "desktop") {
        const Webview = app.loader.webview();
        const webview = new Webview();
        const { host, port } = app.get("http");
        webview.navigate(`http://${host}:${port}${start}`);
        webview.run();
        webview.closed(() => {
          //app.stop();
        });
      }
      return next(app);
    },
  };
};
