package main

import "syscall/js"
import "encoding/json"
%%IMPORTS%%

type t_request func(Request) any
type t_response func(js.Value, []js.Value) any
type Object map[string]any
type Array []any

type Dispatcher struct {
  Get func(string) any
  All func() map[string]any
  %%DISPATCH_STRUCT%%
}

type URL struct {
  Href string
  Origin string
  Protocol string
  Username string
  Password string
  Host string
  Hostname string
  Port string
  Pathname string
  Search string
  SearchParams map[string]any
  Hash string
}

type Request struct {
  Url URL
  Body Dispatcher
  Path Dispatcher
  Query Dispatcher
  Cookies Dispatcher
  Headers Dispatcher
  %%REQUEST_STRUCT%%
}

func make_url(request js.Value) URL {
  url := request.Get("url");
  search_params := make(map[string]any);
  json.Unmarshal([]byte(request.Get("search_params").String()), &search_params);

  return URL{
    url.Get("href").String(),
    url.Get("origin").String(),
    url.Get("protocol").String(),
    url.Get("username").String(),
    url.Get("password").String(),
    url.Get("host").String(),
    url.Get("hostname").String(),
    url.Get("port").String(),
    url.Get("pathname").String(),
    url.Get("search").String(),
    search_params,
    url.Get("hash").String(),
  };
}

func make_dispatcher(key string, request js.Value) Dispatcher {
  properties := make(map[string]any);
  value := request.Get(key)
  json.Unmarshal([]byte(value.Get("properties").String()), &properties);

  return Dispatcher{
    func(property string) any {
      switch properties[property].(type) {
        case string:
          return properties[property].(string);
        default:
          return nil;
        }
    },
    func() map[string]any {
      return properties;
    },
    %%DISPATCH_MAKE%%
  };
}

func make_request(route t_request, request js.Value) any {
  go_request := Request{
    make_url(request),
    make_dispatcher("body", request),
    make_dispatcher("path", request),
    make_dispatcher("query", request),
    make_dispatcher("cookies", request),
    make_dispatcher("headers", request),
    %%REQUEST_MAKE%%
  };

  response := route(go_request);
  switch response.(type) {
    case js.Func:
      return response;
    default:
      marshalled, _ := json.Marshal(response);
      return string(marshalled);
    }
}

func make_empty(route func() any) any {
  response := route();
  switch response.(type) {
    case js.Func:
      return response;
    default:
      marshalled, _ := json.Marshal(response);
      return string(marshalled);
    }
}
