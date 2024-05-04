import Webview from "@rcompat/webview/worker";

export default ({
  start = "/svelte",
} = {}) => {
  return {
    name: "primate:native",
    async serve(app, next) {
      const webview = new Webview();
      const { host, port } = app.get("http");
      webview.navigate(`http://${host}:${port}${start}`);
      webview.run();
      return next(app);
    },
  };
};
