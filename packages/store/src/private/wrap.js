import invalid_document from "#error/invalid-document";
import invalid_value from "#error/invalid-value";
import no_document from "#error/no-document";
import primary from "#primary";
import maybe from "@rcompat/invariant/maybe";
import empty from "@rcompat/object/empty";
import filter from "@rcompat/object/filter";
import transform from "@rcompat/object/transform";
import tryreturn from "@rcompat/sync/tryreturn";
import bases from "./wrap/bases.js";
import validate from "./wrap/validate.js";

const serdes = to => ({ types, schema, document = {}, path, mode }) =>
  transform(document, entry => entry
    .map(([field, value]) =>
      tryreturn(_ => [field, types[bases[schema[field].base]][to](value)])
        .orelse(_ => {
          if (mode === "loose") {
            return [field, document[field]];
          }
          const command = `(await ${path}.get("${document.id}")).${field}`;
          return invalid_value(value, name, command);
        }),
    ));
const defined = input => ({
  errors: input.errors,
  document: filter(input.document, ([, value]) => value !== undefined),
});

export default (config, facade, types) => {
  const name = config.name.toLowerCase();
  const path = name.replaceAll("_", ".");
  const { mode = config.defaults.mode, schema, actions = _ => ({}) } = config;

  const pack = document =>
    serdes("in")({ document, path, schema, types, mode });
  const unpack = result => typeof result === "object"
    ? serdes("out")({ document: result, path, schema, types, mode })
    : result;

  const store = {
    connection: facade.connection,
    facade,
    async validate(input) {
      const result = defined(await validate({ input, types, schema, mode }));
      if (empty(result.errors)) {
        return result.document;
      }
      invalid_document(Object.keys(result), result.errors);
    },
    async write(input, writer) {
      const document = await this.validate(input);
      return config.readonly ? document : unpack(await writer(pack(document)));
    },
    async get(value) {
      const id = types.primary.in(value);
      const document = await facade.get(name, primary, id);

      document === undefined &&
        no_document(primary, id,
          `${path}.exists({${primary}: ${id}})`, `${path}.get`);

      return unpack(document);
    },
    async count(criteria) {
      maybe(criteria).object();
      return facade.count(name, criteria);
    },
    async find(criteria, projection, options) {
      maybe(criteria).object();
      maybe(projection).array();
      maybe(options).object();

      const documents = await facade.find(name, pack(criteria), projection, options);

      return documents.map(document => unpack(document));
    },
    async exists(criteria) {
      maybe(criteria).object();
      const count = await facade.count(name, criteria);
      return count > 0;
    },
    async insert(document = {}) {
      return this.write(document,
        validated => facade.insert(name, primary, validated));
    },
    async update(criteria, document = {}) {
      maybe(criteria).object();
      return this.write(document,
        validated => facade.update(name, pack(criteria), validated));
    },
    async save(document) {
      return document[primary] === undefined
        ? this.insert(document)
        : this.update({ [primary]: document[primary] }, document);
    },
    async delete(criteria) {
      maybe(criteria).object();
      return facade.delete(name, pack(criteria));
    },
    schema: {
      async create(description) {
        maybe(description).object();
        return facade.schema.create(name, description);
      },
      async delete() {
        return facade.schema.delete(name);
      },
    },
  };

  return { ...store, ...actions(store) };
};
