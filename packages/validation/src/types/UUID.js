const uuid = /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/iu;

export default {
  validate: value => typeof value === "string" && uuid.test(value),
  message: "Must be a valid v4 UUID",
  base: "uuid",
};
