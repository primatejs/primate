import {Path} from "runtime-compat/fs";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const post = async app => {
  // after hook, publish a zero assumptions app.js (no css imports)
  const code = app.entrypoints.filter(({type}) => type === "script")
    .map(entrypoint => entrypoint.code).join("");
  await app.publish({src: `${app.config.dist}.js`, code, type: "module"});

  if (!app.config.http.static.pure) {
    const memoryFiles = await Path.collect(app.paths.static, /\.(?:js|css)$/u,
      {recursive: false});
    await Promise.all(memoryFiles.map(async file => {
      const code = await file.text();
      const src = file.name;
      await app.publish({src, code, type: file.extension === ".js" ?
        "module" : "style"});
    }));
  }
};

export default async app => {
  app.log.info("running publish hooks");
  await [...filter("publish", app.modules), _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
  await post(app);
};
