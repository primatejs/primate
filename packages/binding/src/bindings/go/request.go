package main

import "syscall/js"
import "encoding/json"
%%IMPORTS%%

type t_request func(Request) interface{} 
type t_response func(js.Value, []js.Value) interface{}
type Object map[string]interface{}
type Array []interface{}

type Dispatchable struct {
  Get func(string) string
  GetAll func() map[string]interface{}
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
  SearchParams map[string]interface{}
  Hash string
}

type Request struct {
  Url URL
  Body Dispatchable
  Path Dispatchable
  Query Dispatchable
  Cookies Dispatchable
  Headers Dispatchable
  %%REQUEST_STRUCT%%
}

func make_url(request js.Value) URL {
  url := request.Get("url");
  search_params := make(map[string]interface{});
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

func make_dispatchable(key string, request js.Value) Dispatchable {
  properties := make(map[string]interface{});
  value := request.Get(key)
  json.Unmarshal([]byte(value.Get("properties").String()), &properties);

  return Dispatchable{
    func(property string) string {
      return properties[property].(string);
    },
    func() map[string]interface{} {
      return properties;
    },
    %%DISPATCH_MAKE%%
  };
}

func make_request(route t_request) t_response {
  return func(this js.Value, args[] js.Value) interface{} {
    request := args[0];
    go_request := Request{
      make_url(request),
      make_dispatchable("body", request),
      make_dispatchable("path", request),
      make_dispatchable("query", request),
      make_dispatchable("cookies", request),
      make_dispatchable("headers", request),
      %%REQUEST_MAKE%%
    };

    return route(go_request);
  };
}
