import {numeric} from "runtime-compat/dyndef";
import {filter, valmap} from "runtime-compat/object";
import load from "../load.js";
import {ident} from "../base.js";

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

const filterNull = object => filter(object, ([, value]) => value !== null);
const filterNulls = objects => objects.map(object => filterNull(object));

export default ({
  host = "localhost",
  port = 5432,
  user,
  pass,
  db,
} = {}) => async () => {
  const Driver = await load("postgres");
  const sql = new Driver({
    host,
    port,
    user,
    pass,
    db,
  });

  return {
    name: "postgresql",
    client: sql,
    start() {
      // noop
    },
    rollback() {
      // noop
    },
    commit() {
      // noop
    },
    end() {
      // noop
    },
    types: {
      primary: {
        validate(value) {
          if (numeric(value)) {
            return Number(value);
          }
          throw new Error(`\`${value}\` is not a valid primary key value`);
        },
        ...ident,
        out(value) {
          return Number(value);
        },
      },
      object: {
        in(value) {
          return JSON.stringify(value);
        },
        out(value) {
          return JSON.parse(value);
        },
      },
      number: ident,
      bigint: {
        in(value) {
          return value.toString();
        },
        out(value) {
          return BigInt(value);
        },
      },
      boolean: ident,
      date: {
        in(value) {
          return value;
        },
        out(value) {
          return new Date(value);
        },
      },
      string: ident,
    },
    async create(collection, schema) {
      const body =
        Object.entries(valmap(schema, value => type(value)))
          .map(([column, dataType]) => `"${column}" ${dataType}`).join(",");
      await sql`
        create table
        if not exists 
        ${sql(collection)} (${sql.unsafe(body)})
      `;
    },
    async drop(collection) {
      await sql`drop table if exists ${sql(collection)};`;
    },
    async find(collection, criteria = {}) {
      return filterNulls(await sql`
        select *
        from ${sql(collection)}
        where ${
         Object.entries(criteria).reduce((acc, [key, value]) =>
           sql`${acc} and ${sql(key)} = ${value}`, sql`true`)
        }
      `);
    },
    async count(collection, criteria = {}) {
      const [{count}] = await sql`
        select count(*)
        from ${sql(collection)}
        where ${
         Object.entries(criteria).reduce((acc, [key, value]) =>
           sql`${acc} and ${sql(key)} = ${value}`, sql`true`)
        }
      `;
      return Number(count);
    },
    async get(collection, primary, value) {
      const [result] = await sql`
        select * 
        from ${sql(collection)} 
        where ${sql(primary)}=${value};
      `;
      return result === undefined ? result : filterNull(result);
    },
    async insert(collection, primary, document) {
      const columns = Object.keys(document);
      const [result] = await sql`insert into
        ${sql(collection)} 
        ${
        columns.length > 0
          ? sql`(${sql(columns)}) values ${sql(document)}`
          : sql.unsafe("default values")
        }
        returning *;
      `;
      return filterNull(result);
    },
    async update(collection, criteria = {}, delta = {}) {
      return (await sql`
        update ${sql(collection)}
        set ${sql({...delta})}
        where ${
         Object.entries(criteria).reduce((acc, [key, value]) =>
           sql`${acc} and ${sql(key)} = ${value}`, sql`true`)
        }
        returning *;
      `).length;
    },
    async delete(collection, criteria = {}) {
      return (await sql`
        delete from ${sql(collection)}
        where ${
         Object.entries(criteria).reduce((acc, [key, value]) =>
           sql`${acc} and ${sql(key)} = ${value}`, sql`true`)
        }
        returning *;
      `).length;
    },
  };
};
