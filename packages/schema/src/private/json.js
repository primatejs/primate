const base = "json";

const json = {
  base,
  validate(value) {
    try {
      return JSON.parse(value);
    } catch (_) {
      throw new Error(`${value} is not a JSON`);
    }
  },
};

export default json;
