const types = {
  /* array */
  blob: "blob",
  boolean: "integer",
  datetime: "text",
  embedded: "text",
  f64: "real",
  i8: "integer",
  i16: "integer",
  i32: "integer",
  i64: "integer",
  json: "text",
  primary: "integer primary key",
  string: "text",
  time: "text",
  u8: "integer",
  u16: "integer",
  u32: "integer",
};

export default value => types[value];
