import { Path } from "rcompat/fs";
import { cascade } from "rcompat/async";
import { stringify } from "rcompat/object";

const post = async app => {
  const { config: { http: { static: { root } } } } = app;

  {
    // after hook, publish a zero assumptions app.js (no css imports)
    const src = new Path(root, app.config.build.index);

    await app.publish({
      code: app.exports.filter(({ type }) => type === "script")
        .map(({ code }) => code).join(""),
      src,
      type: "module",
    });

    const imports = { ...app.importmaps, app: src.path };
    const type = "importmap";
    await app.publish({ inline: true, code: stringify({ imports }), type });
  }

  return app;
};

export default async app =>
  post(await (await cascade(app.modules.publish))(app));
