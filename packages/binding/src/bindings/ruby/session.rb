class Session
  def initialize(session)
    @session = session
  end

  def id
    @session["id"]
  end

  def exists
    @session.call("exists")
  end

  def get(key)
    @session.call("get", key)
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
