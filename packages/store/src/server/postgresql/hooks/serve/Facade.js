import make_sort from "@primate/store/sql/make-sort";
import * as O from "rcompat/object";
import typemap from "./typemap.js";

const filter_null = object => O.filter(object, ([, value]) => value !== null);
const filter_nulls = objects => objects.map(object => filter_null(object));

export default class Connection {
  schema = {
    create: async (name, description) => {
      const { connection } = this;
      const body =
        Object.entries(O.valmap(description, value => typemap(value.base)))
          .map(([column, dataType]) => `"${column}" ${dataType}`).join(",");
      await connection`
        create table if not exists 
        ${connection(name)} (${connection.unsafe(body)})
      `;
    },
    delete: async name => {
      const { connection } = this;
      await connection`drop table if exists ${connection(name)};`;
    },
  };

  constructor(connection) {
    this.connection = connection;
  }

  async find(collection, criteria = {}, projection = [], options = {}) {
    const { connection } = this;
    const rest = make_sort(options);
    const select = projection.length === 0 ? "*" : projection.join(", ");
    return filter_nulls(await connection`
      select ${connection.unsafe(select)}
      from ${connection(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
    connection`${acc} and ${connection(key)} = ${value}`, connection`true`)}
      ${connection.unsafe(rest)}`);
  }

  async count(collection, criteria = {}) {
    const { connection } = this;
    const [{ count }] = await connection`
      select count(*)
      from ${connection(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
    connection`${acc} and ${connection(key)} = ${value}`, connection`true`)}
    `;
    return Number(count);
  }

  async get(collection, primary, value) {
    const { connection } = this;
    const [result] = await connection`
      select * 
      from ${connection(collection)} 
      where ${connection(primary)}=${value};
    `;
    return result === undefined ? result : filter_null(result);
  }

  async insert(collection, primary, document) {
    const { connection } = this;
    const columns = Object.keys(document);
    const [result] = await this.connection`insert into
      ${connection(collection)} 
      ${columns.length > 0
    ? connection`(${connection(columns)}) values ${connection(document)}`
    : connection.unsafe("default values")}
      returning *;
    `;
    return filter_null(result);
  }

  async update(collection, criteria = {}, delta = {}) {
    const { connection } = this;
    return (await connection`
      update ${connection(collection)}
      set ${connection({ ...delta })}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
        connection`${acc} and ${connection(key)} = ${value}`, connection`true`)}
      returning *;
    `).length;
  }

  async delete(collection, criteria = {}) {
    const { connection } = this;
    return (await connection`
      delete from ${connection(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
        connection`${acc} and ${connection(key)} = ${value}`, connection`true`)}
      returning *;
    `).length;
  }
}
