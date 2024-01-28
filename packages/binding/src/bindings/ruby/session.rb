class Session
  def initialize(session, helpers)
    @session = session
    @helpers = helpers
  end

  def id
    @session["id"]
  end

  def exists
    @session.call("exists") == JS::True
  end

  def get(key)
    wrap(@helpers, @session.call("get", key))
  end

  def set(key, value)
    @session.call("set", key, value)
  end

  def create(data = {})
    @session.call("create", data)
  end 

  def destroy()
    @session.call("destroy")
  end 

  def json()
    create_hash(@session.call("json"))
  end
end
