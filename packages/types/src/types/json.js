export const type = "json";

const json = value => {
  try {
    return JSON.parse(value);
  } catch (_) {
    throw new Error(`${value} is not a JSON`);
  }
};

export default json;
