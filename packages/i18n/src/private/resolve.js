export default (locale, key, placeholders = {}) => {
  if (locale[key] === undefined) {
    return key;
  }

  return Object.entries(placeholders).reduce((translated, [p_key, p_value]) =>
    translated.replaceAll(new RegExp(`\\{${p_key}\\}`, "gu"), () => p_value),
  locale[key]);
};
