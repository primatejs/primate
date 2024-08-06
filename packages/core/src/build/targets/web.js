import collect from "@rcompat/fs/collect";

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
      code: `await file(asset${i}).text()`,
      type,
    };
  });
  const d = app.runpath(location.pages);
  const pages = await Promise.all((await collect(d, html, { recursive: true }))
    .map(async file => `${file}`.replace(`${d}/`, _ => "")));
  const pages_str = pages.map(page =>
    `"${page}": await join(import.meta.url, "../${location.pages}/${page}").text(),`).join("\n");

  const assets_scripts = `
  import file from "@rcompat/fs/file";
  import join from "@rcompat/fs/join";
  import stringify from "@rcompat/object/stringify";
  import crypto from "@rcompat/crypto";
  import { OK } from "@rcompat/http/status";
  import { resolve } from "@rcompat/http/mime";

  const encoder = new TextEncoder();
  const hash = async (data, algorithm = "sha-384") => {
    const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
    const prefix = algorithm.replace("-", _ => "");
    return \`\${prefix}-\${btoa(String.fromCharCode(...new Uint8Array(bytes)))}\`;
  };

  ${$imports.map(({ path }, i) =>
    `const asset${i} = await join(import.meta.dirname, "${path}").text();`)
    .join("\n  ")}
  const assets = [${$imports.map(($import, i) => `{
  src: "${$import.src}",
  code: asset${i},
  type: "${$import.type}",
  inline: false,
  integrity: await hash(asset${i}),
  }`).join(",\n  ")}];

  const imports = {
   app: join("${http.static.root}", "${$imports.find($import =>
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
  const buildroot = file(import.meta.url).join("..");

  const serve_asset = asset => new Response(asset.stream(), {
    status: OK,
    headers: {
      "Content-Type": resolve(asset.name),
    },
  });

  const loader = {
    page(name) {
      return pages[name] ?? pages["${app.get("pages.app")}"];
    },
    async asset(pathname) {
      const root_asset = buildroot.join(\`client/\${pathname}\`);
      if (await await root_asset.isFile) {
        return serve_asset(asset);
      }
      const static_asset = buildroot.join(\`client/static/\${pathname}\`);
      if (await static_asset.isFile) {
        return serve_asset(static_asset);
      }
    },
  };
  const target = "web";

  export { assets, loader, target };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
