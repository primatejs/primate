import { File } from "rcompat/fs";

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier, context);
  if (specifier.includes("routes")) {
    console.log("resolve", specifier, context, result);
    return {
      format: "module",
      url: `hot:module?url=${result.url}&rand=${Math.random()}`,
    };
  }

  return result;
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("hot:")) {
    console.log("load", url, context);
    const path = new URL(url).searchParams.get("url");
    const source = await File.text(path);
    return {
      format: "module",
      shortCircuit: true,
      source,
    };
  }

  return nextLoad(url, context);
}
