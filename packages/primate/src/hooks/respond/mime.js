const mimes = {
  binary: "application/octet-stream",
  css: "text/css",
  html: "text/html",
  jpg: "image/jpeg",
  js: "text/javascript",
  mjs: "text/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  woff2: "font/woff2",
  webp: "image/webp",
};

const regex = /\.(?<extension>[a-z1-9]*)$/u;
const match = filename => filename.match(regex)?.groups.extension;

export default filename => mimes[match(filename)] ?? mimes.binary;
