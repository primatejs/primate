import serve from "./serve.js";
import route from "./route.js";
import bundle from "./bundle.js";
import package_json from "../package.json" assert {type: "json"};
import log from "./log.js";

export default async conf => {
  log.reset("Primate").yellow(package_json.version);
  const {paths} = conf;
  const router = await route(paths.routes);
  await bundle(conf);

  await serve({router,
    paths: conf.paths,
    from: conf.paths.public,
    http: conf.http,
  });
};
