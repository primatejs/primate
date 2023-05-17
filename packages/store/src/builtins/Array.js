export default {
  validate: value => Array.isArray(value),
  message: "Must be a valid array",
  type: "array",
};
