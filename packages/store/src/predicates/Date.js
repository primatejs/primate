export default {
  validate: value => value instanceof Date,
  message: "Must be a valid date",
  base: "datetime",
};
