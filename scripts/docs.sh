#!/usr/bin/env bash
npx -y embedme\
  --source-root readme\
  --strip-embed-comment\
  --stdout readme/template.md\
  > README.md

