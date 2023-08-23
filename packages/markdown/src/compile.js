import {marked} from "marked";

const identity_heading = (text, level) => `<h${level}>${text}</h${level}>`;

export default async ({
  app,
  directory,
  options,
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
    const html = target.join(`${filename}.html`.replace(source, ""));
    await html.directory.file.create();
    await html.file.write(content);

    const json = target.join(`${filename}.json`.replace(source, ""));
    await json.file.write(JSON.stringify(toc));
  };
};
