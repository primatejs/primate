const format = /^T?(?<hour>\d{2}):?(?<minute>\d{2}):?(?<second>\d{2})$/u;

const range = {
  hour: 24,
  minute: 59,
  second: 60,
};

const check = time => {
  try {
    const {groups} = format.exec(time);
    return Object.entries(groups).reduce((valid, [name, unit]) =>
      valid && (value => value > 0 && value <= range[name])(unit), true);
  } catch (_) {
    return false;
  }
};

export default {
  validate: value => typeof value === "string" && check(value),
  message: "Must be a valid ISO 8601 time string",
  base: "time",
  type: "time",
};
