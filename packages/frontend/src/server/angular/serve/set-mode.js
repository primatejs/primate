import { enableProdMode } from "@angular/core";

export default mode => {
  if (mode === "production") {
    enableProdMode();
  }
};
