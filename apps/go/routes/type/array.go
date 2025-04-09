package main

import "github.com/primate-run/primate"

func Get(request Request) any {
  return primate.Array[primate.Props]{
    { "name": "Donald" },
    { "name": "Ryan" },
 };
}
