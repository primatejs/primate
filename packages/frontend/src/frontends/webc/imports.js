import client from "./client/render.js";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;

const extension = ".webc";

const extensions = {
  from: extension,
  to: `${extension}.js`,
};

export const compile = {
  async client(text, component, app) {
    const location = app.get("location");
    const source = app.path.components;
    const base = app.runpath(location.client, location.components);
    const path = base.join(`${component.path}.js.impl.js`.replace(source, ""));
    const [script] = await Promise.all([...text.matchAll(script_re)]
      .map(({ groups: { code } }) => code));
    await path.directory.create();
    await path.write(script.replaceAll(extensions.from, extensions.to));
    return { js: client(component.base) };
  },
};

