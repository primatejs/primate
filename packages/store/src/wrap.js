import {tryreturn} from "runtime-compat/flow";
import * as object from "runtime-compat/object";
import validate from "./validate.js";
import errors from "./errors.js";

const {FailedDocumentValidation} = errors;

const transform = direction => ({types, schema, document, path}) =>
  object.transform(document, entry => entry
    .filter(([field]) => schema[field]?.type !== undefined)
    .map(([field, value]) =>
      tryreturn(_ =>
        [field, types[schema[field].base]?.[direction](value) ?? value])
        .orelse(_ => {
          const {name} = schema[field];
          const command = `(await ${path}.get("${document.id}")).${field}`;
          return errors.CannotUnpackValue.throw(value, name, command);
        })
    ));

const actions = [
  "validate", "new",
  "get", "find",
  "insert", "update", "save", "delete",
];

export default (name, schema = {}, options = {}) => {
  const path = name.replaceAll("_", ".");
  const config = {name: name.toLowerCase(), ...options};
  const {driver} = config;
  const {types} = driver;

  return {
    driver,
    store: {
      config,
      pack(document) {
        return transform("in")({document, path, schema, types});
      },
      unpack(document) {
        return transform("out")({document, path, schema, types});
      },
      generate() {
        return driver.primary().then(({generate}) => generate());
      },
      validate(input) {
        return validate({input, driver, schema, strict: config.strict});
      },
      async write(input, writer) {
        const result = await this.validate(input);
        const {document} = result;

        return Object.keys(result.errors).length > 0
          ? (() => {
            const error = FailedDocumentValidation.new(Object.keys(result));
            error.errors = result.errors;
            throw error;
          })()
          : config.readonly ? document :
            this.unpack(await writer(this.pack(document)));
      },
      async get(value) {
        const document = await driver.get(config.name, config.primary, value);

        document === undefined &&
          errors.NoDocumentFound.throw(value, `${path}.exists(id)`);

        return this.unpack(document);
      },
      new() {
        return this.generate().then(primary => ({[config.primary]: primary}));
      },
      async find(criteria) {
        const documents = await driver.find(config.name, criteria);
        return documents.map(document => this.unpack(document));
      },
      async insert(document = {}) {
        const {primary} = this;

        return this.write({
          ...document,
          [primary]: document[primary] ?? await this.generate(),
        }, validated => driver.insert(config.name, validated));
      },
      async update(criteria, document = {}) {
        return this.write(document, validated =>
          driver.update(config.name, criteria, validated));
      },
      save(document) {
        const {primary} = this;

        return document[primary] === undefined
          ? this.insert(document)
          : this.update({[primary]: document[primary]}, document);
      },
      delete(criteria) {
        return driver.delete(config.name, criteria);
      },
    },
    actions(client, store) {
      return {
        ...Object.fromEntries(actions
          .map(action => [action, (...args) => store[action](...args)])),
        ...config.actions(client, store),
      };
    },
  };
};
