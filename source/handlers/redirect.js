const last = -1;

export default async (strings, ...keys) => {
  const awaited_keys = await Promise.all(keys);
  const Location = strings
    .slice(0, last)
    .map((string, i) => string + awaited_keys[i])
    .join("") + strings[strings.length+last];
  return {"code": 302, "headers": {Location}};
};
