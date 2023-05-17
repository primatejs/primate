export default {
  validate: (value, driver) => driver.types.primary.validate(value),
  message: (value, driver) => driver.types.primary.message(value),
  type: "primary",
};
