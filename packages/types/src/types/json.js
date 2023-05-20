const json = value => {
  try {
    return JSON.parse(value);
  } catch (_) {
    throw new Error(`${value} is not a JSON`);
  }
};

json.base = "json";

export default json;
