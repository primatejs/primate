import InvalidValue from "@primate/store/errors/invalid-value";
import InvalidDocument from "@primate/store/errors/invalid-document";
import NoDocument from "@primate/store/errors/no-document";
import { maybe } from "rcompat/invariant";
import * as O from "rcompat/object";
import { tryreturn } from "rcompat/sync";
import bases from "./bases.js";
import primary from "./primary.js";
import validate from "./validate.js";

const transform = to => ({ types, schema, document = {}, path, mode }) =>
  O.transform(document, entry => entry
    .map(([field, value]) =>
      tryreturn(_ => [field, types[bases[schema[field].base]][to](value)])
        .orelse(_ => {
          if (mode === "loose") {
            return [field, document[field]];
          }
          const command = `(await ${path}.get("${document.id}")).${field}`;
          return InvalidValue.throw(value, name, command);
        }),
    ));
const defined = input => ({
  errors: input.errors,
  document: O.filter(input.document, ([, value]) => value !== undefined),
});

export default (config, facade, types) => {
  const name = config.name.toLowerCase();
  const path = name.replaceAll("_", ".");
  const { mode = config.defaults.mode, schema, actions = _ => ({}) } = config;

  const pack = document =>
    transform("in")({ document, path, schema, types, mode });
  const unpack = result => typeof result === "object"
    ? transform("out")({ document: result, path, schema, types, mode })
    : result;

  const store = {
    connection: facade.connection,
    facade,
    async validate(input) {
      const result = defined(await validate({ input, types, schema, mode }));
      if (O.empty(result.errors)) {
        return result.document;
      }
      const error = InvalidDocument.new(Object.keys(result));
      error.errors = result.errors;
      throw error;
    },
    async write(input, writer) {
      const document = await this.validate(input);
      return config.readonly ? document : unpack(await writer(pack(document)));
    },
    async get(value) {
      const id = types.primary.in(value);
      const document = await facade.get(name, primary, id);

      document === undefined &&
        NoDocument.throw(primary, id,
          `${path}.exists({${primary}: ${id}})`, `${path}.get$`);

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
