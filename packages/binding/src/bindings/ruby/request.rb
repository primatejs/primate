require 'json'

class Primate
  def self.view(name, props = {}, options = {})
    {:__PRMT__ => "view", :name => name, :props => props, :options => options}
  end

  def self.redirect(location, options = {})
    {:__PRMT__ => "redirect", :location => location, :options => options}
  end

  def self.error(body, options = {})
    {:__PRMT__ => "error", :body => body, :options => options}
  end
end

class Dispatcher
  def initialize(dispatcher)
    @dispatcher = dispatcher
    @json = JSON.parse(dispatcher.call("toString").to_s)
  end

  def get(name)
    @dispatcher.call("get", name).to_s
  end

  def json() 
    @json 
  end

  %%DISPATCH_DEFS%%
end

class URL
  def initialize(url)
    @href = url["href"].to_s
    @origin = url["origin"].to_s
    @protocol = url["protocol"].to_s
    @username = url["username"].to_s
    @password = url["password"].to_s
    @host = url["host"].to_s
    @hostname = url["hostname"].to_s
    @port = url["port"].to_s
    @pathname = url["pathname"].to_s
    @search = url["search"].to_s
    @hash = url["hash"].to_s
  end

  def href
    @href
  end

  def origin
    @origin
  end

  def protocol
    @protocol
  end

  def username
    @username
  end

  def password
    @password
  end

  def host
    @host
  end

  def hostname
    @hostname
  end

  def port
    @port
  end

  def pathname
    @pathname
  end

  def search
    @search
  end

  def hash
    @hash
  end
end

class Request
  def initialize(request)
    @url = URL.new(request["url"])
    @body = request["body"]
    @path = Dispatcher.new(request["path"])
    @query = Dispatcher.new(request["query"])
    @headers = Dispatcher.new(request["headers"])
    @cookies = Dispatcher.new(request["cookies"])
  end

  def url
    @url
  end

  def body
    @body
  end

  def path
    @path
  end

  def query
    @query
  end

  def headers
    @headers
  end

  def cookies
    @cookies
  end
end
