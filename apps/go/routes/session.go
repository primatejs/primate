package main

import "github.com/primate-run/primate"

func Get(request Request) any {
  primate.Session().Create(primate.Props{ "foo": "bar" })

  return primate.Session().Data;
}
