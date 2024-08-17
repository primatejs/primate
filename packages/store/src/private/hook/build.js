import no_store_directory from "#error/no-store-directory";
import join from "@rcompat/fs/join";

export default directory => async (app, next) => {
  const location = app.get("location");
  const root = app.root.join(directory);
  if (!await root.exists()) {
    no_store_directory(root);
    return next(app);
  }

  await app.stage(app.root.join(directory), join(location.server, directory));

  app.server_build.push("stores");

  return next(app);
};
