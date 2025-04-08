package primate

import "encoding/json";
import "syscall/js"

func try_map(array []Object[any], position uint8, fallback Object[any]) Object[any] {
  if (len(array) <= int(position)) {
    return fallback;
  }
  return array[position];
}

func try_int(array []int, position uint8, fallback int) int {
  if (len(array) <= int(position)) {
    return fallback;
  }
  return array[position];
}

func serialize(data map[string]interface{}) string {
  if (data == nil) {
    return "";
  }

  serialized, err := json.Marshal(data);
  if err != nil {
    return "";
  }

  return string(serialized);
}

type Object[T any] map[string]T;
type Array[T any] []T;
type Props = Object[any];
type Options = Object[any];
type SessionData = Object[any];

type Session struct {
  New bool
  Id string
  Data SessionData
  Create func(SessionData)
  Delete func()
}

type Primate struct {
  props Props
  Session func() Session
  View func(string, Props, ...Options) any
  Redirect func(string, ...int) any
  Error func(...Options) any
};

var primate = Primate{
  Props{},
  func() Session {
    var session = js.Global().Get("PRMT_SESSION");

    data := make(Object[any]);
    json.Unmarshal([]byte(session.Get("data").String()), &data);

    return Session{
      session.Get("new").Bool(),
      session.Get("id").String(),
      data,
      func(data SessionData) {
        serialized, _ := json.Marshal(data);
        session.Get("create").Invoke(string(serialized));
      },
      func() {
        session.Get("delete").Invoke();
      },
    };
  },
  func(component string, props Props, options ...Options) any {
    var serde_props = serialize(props);

    var serde_options = serialize(try_map(options, 0, Object[any]{}));

    return js.FuncOf(func(this js.Value, args[] js.Value) any {
      return map[string]any{
        "handler": "view",
        "component": component,
        "props": serde_props,
        "options": serde_options,
      };
    });
  },
  func(location string, ints ...int) any {
    var status = try_int(ints, 0, 302);

    return js.FuncOf(func(this js.Value, args[] js.Value) any {
      return map[string]any{
        "handler": "redirect",
        "location": location,
        "status": status,
      };
    });
  },
  func(options ...Options) any {
    var serde_options = serialize(try_map(options, 0, Object[any]{}));

    return js.FuncOf(func(this js.Value, args[] js.Value) any {
      return map[string]any{
        "handler": "error",
        "options": serde_options,
      };
    });
  },
};
