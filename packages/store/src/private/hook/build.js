import no_store_directory from "#error/no-store-directory";
import join from "@rcompat/fs/join";
import invalid_type from "#error/invalid-type";
import transform from "@rcompat/object/transform";
import primary from "#primary";
import no_primary_key from "#error/no-primary-key";
import empty from "@rcompat/object/empty";

const valid_type = ({ base, validate }) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) =>
  valid_type(type) ? type : invalid_type(name, store);

export default directory => async (app, next) => {
  const location = app.get("location");
  const root = app.root.join(directory);
  if (!await root.exists()) {
    no_store_directory(root);
    return next(app);
  }

  await Promise.all((await root.collect()).map(async store => {
    const { name } = store;
    const definition = await store.import();
    const schema = transform(definition.default ?? {}, entry => entry
      .filter(([property, type]) => valid(type, property, name)));

    let { ambiguous } = definition;
    // consider a store ambiguous if no (or empty) default export
    if (empty(schema)) {
      ambiguous = true;
    }

    !ambiguous && schema.id === undefined
      && no_primary_key(primary, name, "export const ambiguous = true;");
  }));

  await app.stage(app.root.join(directory), join(location.server, directory));

  app.server_build.push("stores");

  return next(app);
};
