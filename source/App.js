import {Path, File, log} from "runtime-compat";
import Bundler from "./Bundler.js";
import Router from "./Router.js";
import Server from "./Server.js";
import package_json from "../package.json" assert {"type": "json"};

export default class App {
  constructor(conf) {
    this.conf = conf;
  }

  async run() {
    log.reset("Primate").yellow(package_json.version);
    const routes = await File.list(this.conf.paths.routes);
    for (const route of routes) {
      await import(Path.resolve(`${this.conf.paths.routes}/${route}`));
    }
    await new Bundler(this.conf).bundle();

    const conf = {"router": Router,
      "serve_from": this.conf.paths.public,
      "http": {
        ...this.conf.http,
        "key": File.read_sync(Path.resolve(this.conf.http.ssl.key)),
        "cert": File.read_sync(Path.resolve(this.conf.http.ssl.cert)),
        "keyFile": Path.resolve(this.conf.http.ssl.key),
        "certFile": Path.resolve(this.conf.http.ssl.cert),
      },
    };
    this.server = new Server(conf);
    await this.server.run();
    this.server.listen();
  }
}
