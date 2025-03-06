import FileRef from "@rcompat/fs/FileRef";

export default (text: string) => `import escape from "@primate/htmx/escape";
  export default (props = {}, options) => {
  const encoded = JSON.parse(escape(JSON.stringify(props)));
  const keys = Object.keys(encoded);
  const values = Object.values(encoded);
  const text = ${JSON.stringify(text)};
  return new Function(...keys, \`return \\\`\${text}\\\`;\`)(...values);
}`;
