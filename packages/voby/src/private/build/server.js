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
};

export default async text => (await transform(text, options)).code;
