export default {
  validate: value => {
    try {
      JSON.parse(value);
      return true;
    } catch (_) {
      return false;
    }
  },
  message: "Must be a valid JSON string",
  base: "json",
};
