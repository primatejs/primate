const desktop = {
  flags: "",
};

const linux_x64 = {
  flags: "--target=bun-linux-x64",
  exe: "app",
};

const windows_x64 = {
  flags: "--target=bun-windows-x64",
  exe: "app.exe",
};

const darwin_x64 = {
  flags: "--target=bun-darwin-x64",
  exe: "app",
};

const darwin_arm64 = {
  flags: "--target=bun-darwin-arm64",
  exe: "app",
};

export default {
  desktop,
  "linux-x64": linux_x64,
  "windows-x64": windows_x64,
  "darwin-x64": darwin_x64,
  "darwin-arm64": darwin_arm64,
};
