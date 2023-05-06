export default {
  validate: value => typeof value === "object" && value !== null,
  message: "Must be a valid object",
  base: "composite",
};
