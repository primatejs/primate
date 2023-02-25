const response = {
  status: 200,
  headers: {"Content-Type": "application/json"},
};

export default (strings, ...keys) => async () =>
  ({...response, body: JSON.stringify(await keys[0])});
