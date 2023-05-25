export default (min, max) => value => {
  if (value >= min && value <= max) {
    return value;
  }
  throw new Error(`${value} is not in the range of ${min} of ${max}`);
};
