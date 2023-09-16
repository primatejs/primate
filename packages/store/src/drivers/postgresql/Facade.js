import {filter, keymap, valmap} from "runtime-compat/object";

const types = {
  /* array */
  blob: "bytea",
  boolean: "boolean",
  datetime: "timestamp",
  embedded: "text",
  f64: "real",
  i8: "smallint",
  i16: "integer",
  i32: "bigint",
  i64: "decimal",
  json: "json",
  primary: "serial primary key",
  string: "text",
  time: "time",
  u8: "smallint",
  u16: "integer",
  u32: "integer",
};
const type = value => types[value];

const filter_null = object => filter(object, ([, value]) => value !== null);
const filter_nulls = objects => objects.map(object => filter_null(object));

export default class Connection {
  schema = {
    create: async (name, description) => {
      const body =
        Object.entries(valmap(description, value => type(value.base)))
          .map(([column, dataType]) => `"${column}" ${dataType}`).join(",");
      await this.sql`
        create table if not exists 
        ${this.sql(name)} (${this.sql.unsafe(body)})
      `;
    },
    delete: async name => {
      await this.sql`drop table if exists ${this.sql(name)};`;
    },
  };

  constructor(sql) {
    this.sql = sql;
  }

  async find(collection, criteria = {}) {
    return filter_nulls(await this.sql`
      select *
      from ${this.sql(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
    this.sql`${acc} and ${this.sql(key)} = ${value}`, this.sql`true`)}
    `);
  }

  async count(collection, criteria = {}) {
    const [{count}] = await this.sql`
      select count(*)
      from ${this.sql(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
    this.sql`${acc} and ${this.sql(key)} = ${value}`, this.sql`true`)}
    `;
    return Number(count);
  }

  async get(collection, primary, value) {
    const [result] = await this.sql`
      select * 
      from ${this.sql(collection)} 
      where ${this.sql(primary)}=${value};
    `;
    return result === undefined ? result : filter_null(result);
  }

  async insert(collection, primary, document) {
    const columns = Object.keys(document);
    const [result] = await this.sql`insert into
      ${this.sql(collection)} 
      ${columns.length > 0
    ? this.sql`(${this.sql(columns)}) values ${this.sql(document)}`
    : this.sql.unsafe("default values")}
      returning *;
    `;
    return filter_null(result);
  }

  async update(collection, criteria = {}, delta = {}) {
    return (await this.sql`
      update ${this.sql(collection)}
      set ${this.sql({...delta})}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
        this.sql`${acc} and ${this.sql(key)} = ${value}`, this.sql`true`)}
      returning *;
    `).length;
  }

  async delete(collection, criteria = {}) {
    return (await this.sql`
      delete from ${this.sql(collection)}
      where ${Object.entries(criteria).reduce((acc, [key, value]) =>
        this.sql`${acc} and ${this.sql(key)} = ${value}`, this.sql`true`)}
      returning *;
    `).length;
  }
}
