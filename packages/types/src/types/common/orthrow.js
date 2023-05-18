export default (predicate, message) => {
  try {
    return predicate();
  } catch (_) {
    throw new Error(message);
  }
};
