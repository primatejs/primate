import { collect } from "@rcompat/fs";
const html = /^.*.html$/u;

export default async app => {
  const location = app.get("location");
  const http = app.get("http");
  const client = app.runpath(location.client);
  const re = /app..*(?:js|css)$/u;
  const $imports = (await Promise.all((await client.collect(re, { recursive: false }))
    .map(async (file, i) => {
      const type = file.extension === ".css" ? "style" : "js";
      const src = `${http.static.root}${file.debase(client).name}`;
      const path = `./${file.debase(`${app.path.build}/`)}`;
      return {
        src,
        path,
        code: `await text(asset${i})`,
        type,
        empty: (await file.text()).length === 0,
      };
    }))).filter(file => !file.empty);
  const d = app.runpath(location.pages);
  const pages = await Promise.all((await collect(d, html, { recursive: true }))
    .map(async file => `${file}`.replace(`${d}/`, _ => "")));
  const app_js = $imports.find($import => $import.src.endsWith(".js"));

  const assets_scripts = `
  import Webview from "@rcompat/webview/worker/${app.build_target}";
  import { join, text } from "@rcompat/fs";
  import { stringify } from "rcompat/object";
  import crypto from "rcompat/crypto";

  const encoder = new TextEncoder();
  const hash = async (data, algorithm = "sha-384") => {
    const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
    const prefix = algorithm.replace("-", _ => "");
    return \`\${prefix}-\${btoa(String.fromCharCode(...new Uint8Array(bytes)))}\`;
  };

  ${$imports.map(({ path }, i) =>
    `import asset${i} from "${path}" with { type: "file" };
    const file${i} = await text(asset${i});`).join("\n  ")}
  const assets = [${$imports.map(($import, i) => `{
  src: "${$import.src}",
  code: file${i},
  type: "${$import.type}",
  inline: false,
  integrity: await hash(file${i}),
  }`).join(",\n  ")}];

  ${app_js === undefined ? "" :
    `const imports = {
     app: join("${http.static.root}", "${$imports.find($import =>
  $import.src.includes("app") && $import.src.endsWith(".js")).src}").webpath(),
    };
    // importmap
    assets.push({
      inline: true,
      code: stringify({ imports }),
      type: "importmap",
      integrity: await hash(stringify({ imports })),
    });`}

  ${pages.map((page, i) =>
    `import i_page${i} from "./${location.pages}/${page}" with { type: "file" };
    const page${i} = await text(i_page${i});`).join("\n  ")}

  const pages = {
  ${pages.map((page, i) => `"${page}": page${i},`).join("\n  ")}
  };

  const loader = {
    page(name) {
      return pages[name] ?? pages["${app.get("pages.app")}"];
    },
    asset(pathname) {
      return assets.find(asset => asset.src === pathname);
    },
    webview() {
      return Webview;
    }
  };
  const target = "desktop";

  export { assets, loader, target };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
