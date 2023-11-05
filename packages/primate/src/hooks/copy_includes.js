import { Path } from "rcompat/fs";

export default async (app, type, post = () => undefined) => {
  const { config } = app;
  const { build } = config;
  const { includes } = build;

  const reserved = Object.values(app.config.location);

  if (Array.isArray(includes)) {
    await Promise.all(includes
      .filter(include => !reserved.includes(include))
      .filter(include => /^[^/]*$/u.test(include))
      .map(async include => {
        const path = app.root.join(include);
        if (await path.exists()) {
          const target = Path.join(type, include);
          await app.stage(path, target);
          await post(target);
        }
      }));
  }
};
