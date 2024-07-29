import manifest from "@rcompat/package/manifest";

export default { ...(await manifest(import.meta.filename)).devDependencies };
