export default async (strings, ...keys) => {
  const body = JSON.stringify(await keys[0]);
  const code = 200;
  const headers = {"Content-Type": "application/json"};
  return {body, code, headers};
};
