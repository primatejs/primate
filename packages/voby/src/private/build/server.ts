import transform from "@rcompat/build/transform";

const options = {
  loader: "tsx",
  jsx: "automatic",
  tsconfigRaw: {
    compilerOptions: {
      esModuleInterop: true,
      jsx: "react-jsx",
      jsxImportSource: "voby",
    },
  },
} as const;

export default async (text: string) => (await transform(text, options)).code;
