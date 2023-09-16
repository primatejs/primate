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

export default value => types[value];

