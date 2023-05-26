import validate from "./validate.js";
import errors from "./errors.js";

const transform = direction => ({types, schema, document, path}) =>
  Object.fromEntries(Object.entries(document)
    .filter(([field]) => schema[field]?.type !== undefined)
    .map(([field, value]) => {
      try {
        return [field, types[schema[field].base]?.[direction](value) ?? value];
      } catch (error) {
        const {name} = schema[field];
        const command = `(await ${path}.get("${document.id}")).${field}`;
        return errors.CannotUnpackValue.throw(value, name, command);
      }
    }));

const pack = transform("in");
const unpack = transform("out");

export default class Store {
  #schema;
  #config = {};
  #path;

  constructor(name, schema = {}, config = {}) {
    this.#schema = schema;
    this.#path = name.replaceAll("_", ".");
    this.#config = {name: name.toLowerCase(), ...config};
  }

  get driver() {
    return this.#config.driver;
  }

  get primary() {
    return this.#config.primary;
  }

  get name() {
    return this.#config.name;
  }

  get readonly() {
    return this.#config.readonly;
  }

  get strict() {
    return this.#config.strict;
  }

  async validate(input) {
    return validate({
      /* the driver in use */
      driver: this.driver,
      /* the input to be validated */
      input,
      /* the schema to validate against */
      schema: this.#schema,
      /* whether all fields must be non-empty */
      strict: this.#config.strict,
    });
  }

  #pack(document) {
    return pack({
      types: this.driver.types,
      schema: this.#schema,
      document,
      path: this.#path,
    });
  }

  #unpack(document) {
    return unpack({
      types: this.driver.types,
      schema: this.#schema,
      document,
      path: this.#path,
    });
  }

  new() {
    return this.driver.primary().then(({generate}) =>
      ({[this.primary]: generate()}));
  }

  async get(value) {
    const {name} = this;
    const path = this.#path;

    const document = await this.driver.get(name, this.primary, value);

    document === undefined &&
      errors.NoDocumentFound.throw(value, `${path}.exists(id)`);

    return this.#unpack(document);
  }

  async find(criteria) {
    const documents = await this.driver.find(this.name, criteria);
    return documents.map(document => this.#unpack(document));
  }

  async #write(input, writer) {
    const result = await this.validate(input);
    const {document} = result;

    return Object.keys(result.errors).length > 0
      ? (() => {
        const error = errors.FailedDocumentValidation.new(Object.keys(result));
        error.errors = result.errors;
        throw error;
      })()
      : this.readonly ? document :
        this.#unpack(await writer(this.#pack(document)));
  }

  #generate() {
    return this.driver.primary().then(({generate}) => generate());
  }

  async insert(document = {}) {
    const {primary} = this;

    return this.#write({
      ...document,
      [primary]: document[primary] ?? await this.#generate(),
    }, validated => this.driver.insert(this.name, validated));
  }

  async update(criteria, document = {}) {
    return this.#write(document, validated =>
      this.driver.update(this.name, criteria, validated));
  }

  save(document) {
    const {primary} = this;

    return document[primary] === undefined
      ? this.insert(document)
      : this.update({[primary]: document[primary]}, document);
  }

  delete(criteria) {
    return this.driver.delete(this.name, criteria);
  }
};
