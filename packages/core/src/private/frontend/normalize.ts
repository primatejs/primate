import hash from "@rcompat/crypto/hash";

export default (module: string) =>
  async (path: string) =>
    `${module}_${await hash(path)}`;
