export default async (strings, ...keys) => {
  const body = JSON.stringify(await keys[0]);
  const headers = {"Content-Type": "application/json"};
  const code = 200;
  return {body, code, headers};
};
