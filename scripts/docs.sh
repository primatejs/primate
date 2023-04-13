#!/usr/bin/env bash
npx -y embedme\
  --source-root docs/primate\
  --strip-embed-comment\
  --stdout docs/primate/template.md\
  > packages/primate/README.md

