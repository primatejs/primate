import {tryreturn} from "runtime-compat/sync";
import * as object from "runtime-compat/object";
import validate from "./validate.js";
import errors from "./errors.js";
import bases from "./bases.js";
import primary from "./primary.js";

const {FailedDocumentValidation} = errors;

const transform = to => ({types, schema, document, path}) =>
  object.transform(document, entry => entry
    .map(([field, value]) =>
      tryreturn(_ => [field, types[bases[schema[field].base]][to](value)])
        .orelse(_ => {
          const {name} = schema[field];
          const command = `(await ${path}.get("${document.id}")).${field}`;
          return errors.CannotUnpackValue.throw(value, name, command);
        })
    ));

const actions = [
  "validate",
  "get", "count", "find", "exists",
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
      async validate(input) {
        const result = await validate({input, driver, schema,
          strict: config.strict});
        if (Object.keys(result.errors).length > 0) {
          const error = FailedDocumentValidation.new(Object.keys(result));
          error.errors = result.errors;
          throw error;
        } else {
          return result.document;
        }
      },
      async write(input, writer) {
        const document = await this.validate(input);
        return config.readonly
          ? document
          : this.unpack(await writer(this.pack(document)));
      },
      async get(value) {
        const document = await driver.get(config.name, primary, value);

        document === undefined &&
          errors.NoDocumentFound.throw(primary, value,
            `${path}.exists({${primary}: ${value}})`, `${path}.get$`);

        return this.unpack(document);
      },
      /*async get$(value) {
        const document = await driver.get(config.name, primary, value);

        if (document === undefined) {
          const {message} = errors.NoDocumentFound.new(primary, value);
          return {failed: true, reason: message};
        }

        return {failed: false, value: document};
      },*/
      count(criteria) {
        return driver.count(config.name, criteria);
      },
      async find(criteria) {
        const documents = await driver.find(config.name, criteria);
        return documents.map(document => this.unpack(document));
      },
      async exists(criteria) {
        const count = await driver.count(config.name, criteria);
        return count > 0;
      },
      insert(document = {}) {
        return this.write(document,
          validated => driver.insert(config.name, primary, validated));
      },
      update(criteria, document = {}) {
        return this.write(document,
          validated => driver.update(config.name, criteria, validated));
      },
      save(document) {
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
