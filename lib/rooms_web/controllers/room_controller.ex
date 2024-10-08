defmodule RoomsWeb.RoomController do
  use RoomsWeb, :controller

  @room_table :rooms

  def init_table do
    :ets.new(@room_table, [:named_table, :set, :public])
  end

  def index(conn, _params) do
    rooms = :ets.tab2list(@room_table) |> Enum.map(fn {room, _} -> room end)
    json(conn, %{rooms: rooms})
  end
  
  def show(conn, %{"id" => id}) do
    case :ets.lookup(@room_table, id) do
      [{room, messages}] ->
        json(conn, %{room: room, messages: messages})

      [] ->
        send_resp(conn, 404, "Room not found")
    end
  end

  def create(conn, %{"name" => name}) do
    :ets.insert(@room_table, {name, []})
    json(conn, %{message: "Room created", room: name})
  end

  def delete(conn, %{"id" => id}) do
    IO.inspect("Deleting room: #{id}")
    :ets.delete(@room_table, id)
    json(conn, %{message: "Room deleted", room: id})
  end

  def update(room_name, message) do
    case :ets.lookup(@room_table, room_name) do
      [{room_name, messages}] ->
        new_messages =
          [message | messages]
          # Keep only the last 20 messages
          |> Enum.take(20)

        :ets.insert(@room_table, {room_name, new_messages})

      [] ->
        :error
    end
  end

  # def update(conn, %{"id" => id, "new_name" => new_name}) do
  #   case :ets.lookup(@room_table, id) do
  #     [{_room, messages}] ->
  #       :ets.delete(@room_table, id)
  #       :ets.insert(@room_table, {new_name, messages})
  #       json(conn, %{message: "Room updated", room: new_name})

  #     [] ->
  #       send_resp(conn, 404, "Room not found")
  #   end
  # end
end
