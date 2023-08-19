import {marked} from "marked";

const identity_heading = (text, level) => `<h${level}>${text}</h${level}>`;

export default async ({
  app,
  directory,
  options,
  props = [],
}) => {
  const {location} = app.config;
  const monkeyed_heading = options?.renderer?.heading ?? identity_heading;
  const source = app.runpath(directory);
  const target = app.runpath(location.server, directory);
  await target.file.create();

  return async (filename, input) => {
    const toc = [];
    const renderer = {
      ...options?.renderer ?? {},
      heading(text, level) {
        const name = text.toLowerCase().replaceAll(/[?{}%]/gu, "");
        toc.push({level, text, name});
        return monkeyed_heading(text, level);
      },
    };
    marked.use({
      ...options,
      renderer,
    });
    const content = marked.parse(input);
    const code = `
      export function toc() {
        return JSON.parse(${JSON.stringify(JSON.stringify(toc))});
      }
      export function render(props = {}) {
        ${props.map(prop => `const {${prop} = ""} = props;`).join("\n")}
        return \`${content}\`;
      }`;
    const to = target.join(`${filename}.js`.replace(source, ""));
    await to.directory.file.create();
    await to.file.write(code);
  };
};
