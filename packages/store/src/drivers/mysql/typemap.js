const types = {
  /* array */
  blob: "blob",
  boolean: "bool",
  datetime: "datetime",
  embedded: "text",
  f64: "double",
  i8: "tinyint",
  i16: "smallint",
  i32: "int",
  i64: "bigint",
  i128: "decimal",
  json: "json",
  primary: "int not null auto_increment primary key",
  string: "text",
  time: "time",
  u8: "tinyint",
  u16: "smallint",
  u32: "int",
  u64: "bigint",
  u128: "decimal",
};

export default value => types[value];

