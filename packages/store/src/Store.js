import validate from "./validate.js";

export default class Store {
  #schema;
  #config = {};

  constructor(name, schema = {}, options = {}) {
    this.#schema = schema;
    this.#config = {name: name.toLowerCase(), ...options};
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

  async validate(input) {
    if (!this.#config.validate) {
      return {error: {}, document: input};
    }
    return validate({
      /* name of the primary field as well the driver's primary validate
       * function */
      primary: {
        name: this.primary,
        value: {...await this.driver.primary()},
      },
      /* the input to be validated */
      input,
      /* the schema to validate against */
      schema: this.#schema,
    });
  }

  new() {
    return this.driver.primary().then(({generate}) =>
      ({[this.primary]: generate()}));
  }

  get(value) {
    return this.driver.get(this.name, this.primary, value);
  }

  find(criteria) {
    return this.driver.find(this.name, criteria);
  }

  async #validate(input, onSuccess) {
    const {error, document} = await this.validate(input);

    return Object.keys(error).length === 0
      ? {document: this.readonly ? document : await onSuccess(document)}
      : {error};
  }

  #generate() {
    return this.driver.primary().then(({generate}) => generate());
  }

  async insert(document = {}) {
    const {primary} = this;

    return this.#validate({
      ...document,
      [primary]: document[primary] ?? await this.#generate(),
    }, validated => this.driver.insert(this.name, validated));
  }

  update(criteria, document = {}) {
    return this.#validate(document, validated =>
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
}
