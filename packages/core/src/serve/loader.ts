import asset from "#serve/asset";
import FileRef from "@rcompat/fs/FileRef";
import type Dictionary from "@rcompat/record/Dictionary";

type Options = {
  pages_app: string,
  pages: Dictionary<string>,
  rootfile: string,
  static_root: string,
};

export default ({
  pages_app,
  pages,
  rootfile,
  static_root,
}: Options) => {
  const buildroot = new FileRef(rootfile).join("..");

  return {
    page(name?: string) {
      if (name === undefined) {
        return pages[pages_app];
      }
      return pages[name] ?? pages[pages_app];
    },
    async asset(pathname: string) {
      const client_file = buildroot.join(`client/${pathname}`);
      if (await client_file.isFile()) {
        return asset(client_file);
      }
      if (pathname.startsWith(static_root)) {
        const assetname = pathname.slice(static_root.length);
        const static_file = buildroot.join(`server/static/${assetname}`);
        if (await static_file.isFile()) {
          return asset(static_file);
        }
      }
    },
  };
};
