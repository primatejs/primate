export default (_, ...keys) => async () => [await keys[0], {
  status: 200,
  headers: {"Content-Type": "application/octet-stream"},
}];
