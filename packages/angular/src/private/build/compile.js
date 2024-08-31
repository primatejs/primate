import transform from "@rcompat/build/transform";

const options = {
  loader: "ts",
  tsconfig: {
    compilerOptions: {
      experimentalDecorators: true,
    },
  },
};

export default async text => (await transform(text, options)).code;
