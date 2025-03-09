import transform from "@rcompat/build/transform";

const options = {
  loader: "ts",
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
    },
  },
} as const;

export default async (text: string) => (await transform(text, options)).code;
