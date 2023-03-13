export default (_, ...keys) => async () => [JSON.stringify(await keys[0]), {
  status: 200,
  headers: {"Content-Type": "application/json"},
}];
