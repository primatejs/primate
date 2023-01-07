import {log} from "runtime-compat";
import {Path, File} from "runtime-compat/filesystem";
import {default as Bundler, index} from "./Bundler.js";
import Router from "./Router.js";
import Server from "./Server.js";
import package_json from "../package.json" assert {"type": "json"};

export default class App {
  constructor(conf) {
    this.conf = conf;
  }

  async run() {
    log.reset("Primate").yellow(package_json.version);
    const {paths} = this.conf;
    const routes = (await Path.list(paths.routes)).map(route => import(route));
    await Promise.all(routes.map(async route => (await route).default(Router)));
    await new Bundler(this.conf).bundle();
    this.index = await index(this.conf);

    const conf = {router: Router,
      serve_from: this.conf.paths.public,
      http: {
        ...this.conf.http,
        key: await File.read(Path.resolve(this.conf.http.ssl.key)),
        cert: await File.read(Path.resolve(this.conf.http.ssl.cert)),
        keyFile: Path.resolve(this.conf.http.ssl.key),
        certFile: Path.resolve(this.conf.http.ssl.cert),
      },
    };
    this.server = new Server(conf);
    await this.server.run();
    this.server.listen();
  }
}
