package main

import "syscall/js"
import "encoding/json"
import "errors"

type Session struct {
  Exists func() bool
  Get func(string) interface{}
  GetAll func() map[string]interface{}
  Set func(string, interface{}) error
  Create func(map[string]interface{})
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
    func(key string) interface{} {
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
    // GetAll
    func() map[string]interface{} {
      data := make(map[string]interface{});
      json.Unmarshal([]byte(session.Get("getAll").Invoke().String()), &data);
      return data;
    },
    // Set
    func(key string, value interface{}) error {
      r := session.Get("set").Invoke(key, value);
      if (r.Type() == 7) {
        return errors.New(r.Invoke().String());
      }
      return nil
    },
    // Create
    func(data map[string]interface{}) {
      session.Get("create").Invoke(data);
    },
    // Destroy
    func() {
      session.Get("destroy").Invoke();
    },
  };
}
