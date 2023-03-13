const last = -1;

export default (strings, ...keys) => async () => {
  const awaitedKeys = await Promise.all(keys);
  const body = strings
    .slice(0, last)
    .map((string, i) => string + awaitedKeys[i])
    .join("") + strings[strings.length + last];

  return [body, {status: 200, headers: {"Content-Type": "text/plain"}}];
};
