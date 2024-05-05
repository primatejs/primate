import gi from "node-gtk";

const Gtk = gi.require("Gtk", "3.0");
const WebKit2 = gi.require("WebKit2");

gi.startLoop();

Gtk.init();

const window = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
const webView = new WebKit2.WebView();
const scrollWindow = new Gtk.ScrolledWindow({});

const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

scrollWindow.add(webView);

vbox.packStart(hbox, false, true, 0);
vbox.packStart(scrollWindow, true, true, 0);

window.setDefaultSize(1024, 720);
window.setResizable(true);
window.add(vbox);

window.on("show", () => Gtk.main());
window.on("destroy", () => Gtk.mainQuit());
window.on("delete-event", () => false);

export default () => {
  return {
    name: "primate:native",
    async init(app, next) {
      setTimeout(() => {
        const { host, port } = app.get("http");
        const url = `http://${host}:${port}`;
        webView.loadUri(url);
        window.showAll();
      }, 5000);

      return next(app);
    },
  };
};
