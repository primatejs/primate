const extend_object = (base = {}, extension = {}) =>
  Object.keys(extension).reduce((result, property) => {
    const value = extension[property];
    result[property] = value?.constructor === Object
      ? extend_object(base[property], value)
      : value;
    return result;
  }, base);

export default extend_object;
