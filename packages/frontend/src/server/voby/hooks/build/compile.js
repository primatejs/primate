import transform from "@rcompat/build/transform";

const options = {
  loader: "tsx",
  jsx: "automatic",
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
      jsx: "react-jsx",
      jsxImportSource: "voby",
    },
  },
};

export const server = async text => (await transform(text, options)).code;
