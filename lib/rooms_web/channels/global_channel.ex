defmodule RoomsWeb.GlobalChannel do
  use RoomsWeb, :channel

  @impl true
  def join("global:info", _params, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_in("update_room", %{"body" => body}, socket) do
    room_name = String.split(socket.topic, ":") |> List.last()
    IO.inspect("----------Sending message in : #{room_name}")
    broadcast!(socket, "update_room", %{body: body})
    {:noreply, socket}
  end
end
