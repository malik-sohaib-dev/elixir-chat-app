defmodule RoomsWeb.PageController do
  use RoomsWeb, :controller
  require Logger

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    Logger.info("page controller is being hit")
    render(conn, :home, layout: false)
  end
end
