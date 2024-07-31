import maybe from "@rcompat/invariant/maybe";
import empty from "@rcompat/object/empty";
import filter from "@rcompat/object/filter";
import valmap from "@rcompat/object/valmap";

const toid = ({ _id, ...rest }) => ({ id: _id, ...rest });
const to_id = ({ id, ...rest }) => id === undefined
  ? rest
  : { _id: id, ...rest };
const cid = criteria => criteria.id === undefined ? criteria : to_id(criteria);
const null_to_set_unset = delta => {
  const $set = filter(delta, ([, value]) => value !== null);
  const $unset = filter(delta, ([, value]) => value === null);
  return { $set, $unset };
};

const make_sort = ({ sort = {} } = {}) => {
  maybe(sort).object();

  return valmap(sort, value => value === "asc" ? 1 : -1);
};

export default class Facade {
  schema = {
    create: async _ => {
      // noop
    },
    delete: async name => {
      await this.#by(name).drop();
    },
  };

  constructor(connection, session) {
    this.connection = connection;
    this.session = session;
  }

  #by(name) {
    return this.connection.collection(name);
  }

  get #options() {
    return { session: this.session };
  }

  async find(name, criteria = {}, projection = [], options = {}) {
    const sort = make_sort(options);
    const $options = {
      ...this.#options,
      ...projection.length === 0
        ? {}
        : {
          projection: {
            // erase _id unless explicit in projection
            _id: 0,
            ...Object.fromEntries(projection.map(field => [field, 1])),
          },
        },
      ...empty(sort) ? {} : { sort },
    };
    return (await this.#by(name).find(cid(criteria), $options).toArray())
      .map(document => toid(document));
  }

  async count(name, criteria = {}) {
    return this.#by(name).countDocuments(criteria, this.#options);
  }

  async get(name, primary, value) {
    const result = await this.#by(name).findOne({ _id: value }, this.#options);
    return result === null ? undefined : toid(result);
  }

  async insert(name, primary, document) {
    await this.#by(name).insertOne(document, this.#options);
    return toid(document);
  }

  async update(name, criteria = {}, delta = {}) {
    return (await this.#by(name)
      .updateMany(cid(criteria), null_to_set_unset(delta), this.#options))
      .modifiedCount;
  }

  async delete(name, criteria = {}) {
    return (await this.#by(name).deleteMany(cid(criteria), this.#options))
      .deletedCount;
  }
}
