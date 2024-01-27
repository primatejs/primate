import swc from "@swc/core";

const options = {
  jsc: {
    parser: {
      syntax: "typescript",
    },
    target: "esnext",
  },
};


const transform = code => swc.transform(code, options);

export default async code => (await transform(code)).code;
