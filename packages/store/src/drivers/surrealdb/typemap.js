const types = {
  // array: ?
  // blob: "BLOB",
  boolean: "bool",
  datetime: "datetime",
  embedded: "object",
  f64: "float",
  i8: "int",
  i16: "int",
  i32: "int",
  // bigint cannot be serialised in JSON
  i64: "string",
  json: "string",
  primary: "string",
  string: "string",
  time: "duration",
  u8: "int",
  u16: "int",
  u32: "int",
};

export default value => types[value];
