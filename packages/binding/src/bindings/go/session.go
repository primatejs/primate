package main

import "syscall/js"
import "encoding/json"
import "errors"

type Session struct {
  Exists func() bool
  Get func(string) any
  All func() map[string]any
  Set func(string, any) error
  Create func(map[string]any)
  Destroy func()
}

func make_session(request js.Value) Session {
  session := request.Get("session");

  return Session{
    // Exists
    func() bool {
      return session.Get("exists").Invoke().Bool();
    },
    // Get
    func(key string) any {
      invoked := session.Get("get").Invoke(key);
      jstype := invoked.Type()
      switch jstype {
        case 0: 
        case 1:
          return nil;
        case 2:
          return invoked.Bool();
        case 3: 
          return invoked.Float();
        case 4:
          return invoked.String();
        // currently unsupported
        case 5:
        case 6:
        case 7:
          return nil;
      }

      return nil;
    },
    // All
    func() map[string]any {
      data := make(map[string]any);
      json.Unmarshal([]byte(session.Get("all").Invoke().String()), &data);
      return data;
    },
    // Set
    func(key string, value any) error {
      r := session.Get("set").Invoke(key, value);
      if (r.Type() == 7) {
        return errors.New(r.Invoke().String());
      }
      return nil
    },
    // Create
    func(data map[string]any) {
      session.Get("create").Invoke(data);
    },
    // Destroy
    func() {
      session.Get("destroy").Invoke();
    },
  };
}
