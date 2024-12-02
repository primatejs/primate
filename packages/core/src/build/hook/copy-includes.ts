import type { PrimateBuildApp } from "#build/app";
import join from "@rcompat/fs/join";

export default async (app: PrimateBuildApp, type: string) => {
  const includes = app.config("build.includes");
  const reserved = Object.values(app.config("location"));

  if (Array.isArray(includes)) {
    await Promise.all(includes
      .filter(include => !reserved.includes(include))
      .filter(include => /^[^/]*$/u.test(include))
      .map(async include => {
        const path = app.root.join(include);
        if (await path.exists()) {
          const target = join(type, include);
          await app.stage(path, target);
        }
      }));
  }
};
