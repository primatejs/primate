const last = -1;

export default async (strings, ...keys) => {
  const awaited_keys = await Promise.all(keys);
  // no body
  const code = 302;
  const headers = {
    Location: strings
      .slice(0, last)
      .map((string, i) => string + awaited_keys[i])
      .join("") + strings[strings.length + last],
  };
  const type = Symbol.for("handler");
  return {code, headers, type};
};
