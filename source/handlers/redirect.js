const last = -1;

export default async (strings, ...keys) => {
  const awaited_keys = await Promise.all(keys);
  const headers = {
    "Location": strings
      .slice(0, last)
      .map((string, i) => string + awaited_keys[i])
      .join("") + strings[strings.length + last],
  };
  const code = 302;
  // no body
  return {code, headers};
};
