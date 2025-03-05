import hash from "@rcompat/crypto/hash";
import name from "#name";

export default async (path: string) => `${name}_${await hash(path)}`;
