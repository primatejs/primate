import { File } from "rcompat/fs";

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
    `import asset${i} from "${path}" with { type: "file" };`,
  ).join("\n  ")}
  const assets = [${$imports.map(($import, i) => `{
  src: "${$import.src}",
  code: await File.text(asset${i}),
  type: "${$import.type}",
  inline: false,
  integrity: await hash(await File.text(asset${i})),
  }`).join(",\n  ")}];

  const imports = {
   app: File.join("${http.static.root}", "${$imports.find($import =>
  $import.src.endsWith(".js")).src}").webpath(),
  };
  // importmap
  assets.push({
    inline: true,
    code: stringify({ imports }),
    type: "importmap",
    integrity: await hash(stringify({ imports })),
  });

  import app_html from "./pages/app.html" with { type: "file" };
  const pages = {
    "app.html": await File.text(app_html),
  };

  const get_asset = pathname => assets.find(asset => asset.src === pathname);

  export { assets, pages, get_asset };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
