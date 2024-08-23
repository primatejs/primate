import collect from "@rcompat/fs/collect";
import webpath from "@rcompat/fs/webpath";

const html = /^.*.html$/u;

export default async app => {
  const location = app.get("location");
  const client = app.runpath(location.client);
  const client_imports = (await client.collect())
    .map((file, i) => {
      const type = file.extension === ".css" ? "style" : "js";
      const src = `/${file.debase(client).name}`;
      const path = `./${file.debase(`${app.path.build}/`)}`;
      return {
        src,
        path,
        code: `await load_text(asset${i})`,
        type,
      };
    });
  const d = app.runpath(location.server, location.pages);
  const pages = await Promise.all((await collect(d, html, { recursive: true }))
    .map(async file => `${file.debase(d)}`.slice(1)));
  const pages_str = pages.map(page =>
    `"${page}": await load_text(import.meta.url,
    "${webpath(`../${location.server}/${location.pages}/${page}`)}"),`).join("\n");

  const assets_scripts = `
  import loader from "primate/loader";
  import load_text from "primate/load-text";

  ${client_imports.map(({ path }, i) =>
    `const asset${i} = await load_text(import.meta.url, "../${path}");`)
    .join("\n  ")}
  const assets = [${client_imports.map(($import, i) => `{
  src: "${$import.src}",
  code: asset${i},
  type: "${$import.type}",
  inline: false,
  }`).join(",\n  ")}];

  const imports = {
    app: "${client_imports.find(({ src }) =>
    src.includes("app") && src.endsWith(".js")).src}"
  };
  // importmap
  assets.push({
    inline: true,
    code: { imports },
    type: "importmap",
  });

  const pages = {
    ${pages_str}
  };

  export default {
    assets,
    loader: loader({
      pages,
      rootfile: import.meta.url,
      pages_app: "${app.get("pages.app")}",
      static_root: "${app.get("http.static.root")}",
    }),
    target: "web",
  };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
