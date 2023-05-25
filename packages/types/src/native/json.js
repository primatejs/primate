export default {
  base: "json",
  type(value) {
    try {
      return JSON.parse(value);
    } catch (_) {
      throw new Error(`${value} is not a JSON`);
    }
  },
};
