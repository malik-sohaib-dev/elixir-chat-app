defmodule RoomsWeb.RoomChannel do
  use RoomsWeb, :channel

  @impl true
  def join("room:" <> room_name, _message, socket) do
    if :ets.lookup(:rooms, room_name) != [] do
      {:ok, socket}
    else
      {:error, %{reason: "room not found"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("new_msg", %{"body" => body}, socket) do
    room_name = String.split(socket.topic, ":") |> List.last()
    IO.inspect("Sending message in : #{room_name}, message: #{body}")
    RoomsWeb.RoomController.update(room_name, body)
    broadcast!(socket, "new_msg", %{body: body})
    {:noreply, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  # defp authorized?(_payload) do
  #   true
  # end
end
