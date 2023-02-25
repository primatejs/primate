const response = {
  status: 200,
  headers: {"Content-Type": "application/octet-stream"},
};

export default (strings, ...keys) => async () =>
  ({...response, body: await keys[0]});
