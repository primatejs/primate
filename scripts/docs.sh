#!/usr/bin/env bash
npx -y embedme\
  --source-root docs\
  --strip-embed-comment\
  --stdout docs/template.md\
  > README.md

