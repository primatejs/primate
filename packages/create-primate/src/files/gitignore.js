export default async root => {
  const entries = [
    "build",
    "node_modules",
    "*.lock",
    ".env*",
  ];
  const contents = `${entries.join("\n")}\n`;
  await root.join(".gitignore").write(contents);
};
