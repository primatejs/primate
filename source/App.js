import {resolve} from "path";
import Bundler from "./Bundler.js";
import File from "./File.js";
import Directory from "./Directory.js";
import Router from "./Router.js";
import Server from "./Server.js";
import log from "./log.js";
import package_json from "../package.json" assert {"type": "json"};

export default class App {
  constructor(conf) {
    this.conf = conf;
    this.Bundler = Bundler;
  }

  async run() {
    log.reset("Primate").yellow(package_json.version);

    const routes = await Directory.list(this.conf.paths.routes);
    for (const route of routes) {
      await import(`${this.conf.paths.routes}/${route}`);
    }
    await new this.Bundler(this.conf).bundle();

    const conf = {"router": Router,
      "serve_from": this.conf.paths.public,
      "http": {
        ...this.conf.http,
        "key": File.read_sync(resolve(this.conf.http.ssl.key)),
        "cert": File.read_sync(resolve(this.conf.http.ssl.cert)),
      },
    };
    this.server = new Server(conf);
    await this.server.run();

    const {port, host} = this.conf.http;
    this.server.listen(port, host);
  }

  stop() {
    this.server.close();
  }
}
