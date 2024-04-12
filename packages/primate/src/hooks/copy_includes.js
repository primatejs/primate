import FS from "rcompat/fs";

export default async (app, type, post = () => undefined) => {
  const includes = app.get("build.includes");
  const reserved = Object.values(app.get("location"));

  if (Array.isArray(includes)) {
    await Promise.all(includes
      .filter(include => !reserved.includes(include))
      .filter(include => /^[^/]*$/u.test(include))
      .map(async include => {
        const path = app.root.join(include);
        if (await path.exists()) {
          const target = FS.File.join(type, include);
          await app.stage(path, target);
          await post(target);
        }
      }));
  }
};
