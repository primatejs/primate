import transform from "@rcompat/build/transform";

const options = {
  loader: "ts",
};

export default async code => (await transform(code, options)).code;
