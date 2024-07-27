import { File } from "rcompat/fs";
const html = /^.*.html$/u;

export default async app => {
  const location = app.get("location");
  const http = app.get("http");
  const client = app.runpath(location.client);
  const re = /app..*(?:js|css)$/u;
  const $imports = (await client.collect(re, { recursive: false })).map((file, i) => {
    const type = file.extension === ".css" ? "style" : "js";
    const src = `${http.static.root}${file.debase(client).name}`;
    const path = `./${file.debase(`${app.path.build}/`)}`;
    return {
      src,
      path,
      code: `await File.text(asset${i})`,
      type,
    };
  });
  const d = app.runpath(location.pages);
  const pages = await Promise.all((await File.collect(d, html, { recursive: true }))
    .map(async file => `${file}`.replace(`${d}/`, _ => "")));
  const pages_str = pages.map(page =>
    `"${page}": await File.text("./${location.pages}/${page}"),`).join("\n");

  const assets_scripts = `
  import { File } from "rcompat/fs";
  import { stringify } from "rcompat/object";
  import crypto from "rcompat/crypto";

  const encoder = new TextEncoder();
  const hash = async (data, algorithm = "sha-384") => {
    const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
    const prefix = algorithm.replace("-", _ => "");
    return \`\${prefix}-\${btoa(String.fromCharCode(...new Uint8Array(bytes)))}\`;
  };

  ${$imports.map(({ path }, i) =>
    `const asset${i} = await new File(import.meta.dirname)
      .join("${path}").text();`).join("\n  ")}
  const assets = [${$imports.map(($import, i) => `{
  src: "${$import.src}",
  code: asset${i},
  type: "${$import.type}",
  inline: false,
  integrity: await hash(asset${i}),
  }`).join(",\n  ")}];

  const imports = {
   app: File.join("${http.static.root}", "${$imports.find($import =>
  $import.src.includes("app") && $import.src.endsWith(".js")).src}").webpath(),
  };
  // importmap
  assets.push({
    inline: true,
    code: stringify({ imports }),
    type: "importmap",
    integrity: await hash(stringify({ imports })),
  });

  const pages = {
    ${pages_str}
  };

  const loader = {
    page(name) {
      return pages[name] ?? pages["${app.get("pages.app")}"];
    },
    asset(pathname) {
      return assets.find(asset => asset.src === pathname);
    },
  };
  const target = "web";

  export { assets, loader, target };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
