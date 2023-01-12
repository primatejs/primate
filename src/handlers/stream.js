const response = {
  code: 200,
  headers: {"Content-Type": "application/octet-stream"},
};

export default (strings, ...keys) => async () =>
  ({...response, body: JSON.stringify(await keys[0])});
