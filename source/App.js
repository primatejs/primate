import {log} from "runtime-compat";
import {Path, File} from "runtime-compat/filesystem";
import Bundler from "./Bundler.js";
import Router from "./Router.js";
import Server from "./Server.js";
import package_json from "../package.json" assert {type: "json"};

export default class App {
  constructor(conf) {
    this.conf = conf;
  }

  async run() {
    log.reset("Primate").yellow(package_json.version);
    const routes = await File.list(this.conf.paths.routes);
    await Promise.all(routes.map(route => import(route.path)));
    const bundler = await new Bundler(this.conf).bundle();
    this.index = await bundler.index();

    const conf = {router: Router,
      serve_from: this.conf.paths.public,
      http: {
        ...this.conf.http,
        key: await Path.resolve(this.conf.http.ssl.key).file.read(),
        cert: await Path.resolve(this.conf.http.ssl.cert).file.read(),
        keyFile: Path.resolve(this.conf.http.ssl.key).path,
        certFile: Path.resolve(this.conf.http.ssl.cert).path,
      },
      index: this.index,
    };
    this.server = new Server(conf);
    await this.server.run();
    this.server.listen();
  }
}
