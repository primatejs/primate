import { File } from "rcompat/fs";
import { cascade } from "rcompat/async";
import o from "rcompat/object";

const post = async app => {
  // after hook, publish a zero assumptions app.js (no css imports)
  const src = File.join(app.get("http.static.root"), app.get("build.index"));

  await app.publish({
    code: app.exports.filter(({ type }) => type === "script")
      .map(({ code }) => code).join(""),
    src,
    type: "module",
  });

  const imports = { ...app.importmaps, app: src.webpath() };
  const type = "importmap";
  await app.publish({ inline: true, code: o.stringify({ imports }), type });

  return app;
};

export default async app =>
  post(await (await cascade(app.modules.publish))(app));
