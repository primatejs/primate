import { enableProdMode } from "@angular/core";
import type Mode from "@primate/core/Mode";

export default (mode: Mode) => {
  if (mode === "production") {
    enableProdMode();
  }
};
