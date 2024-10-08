import { Socket } from "phoenix";
let socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();

let currentChannel = null;
let chatInput = document.querySelector("#chat-input");
let messagesContainer = document.querySelector("#messages");
let roomList = document.querySelector("#room-list");
let roomForm = document.querySelector("#room-form");
let roomInput = document.querySelector("#room-input");
let roomNameHeading = document.querySelector("#room-name");
let deleteActiveRoomButton = document.querySelector("#delete-active-room");
roomNameHeading.innerText = "Active Room: None";

// Join the global info channel
let globalChannel = socket.channel("global:info", {});
globalChannel
  .join()
  .receive("ok", (resp) => {
    console.log("Joined global channel successfully", resp);
  })
  .receive("error", (resp) => {
    console.log("Unable to join", resp);
  });

globalChannel.on("update_room", (payload) => {
  console.log("Room Updated:", payload.name);
  fetchRooms();
});

deleteActiveRoomButton.addEventListener("click", () => {
  if (currentChannel) {
    let roomName = currentChannel.topic.split(":")[1];
    fetch(`/api/rooms/${roomName}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        fetchRooms();
      });
    globalChannel.push("update_room", { body: roomName });
    currentChannel.leave();
    currentChannel = null;
    messagesContainer.innerHTML = "";
    roomNameHeading.innerText = "Active Room: None";
  }
});

// Function to join a room
function joinRoom(roomName) {
  if (currentChannel) {
    currentChannel.leave();
  }

  currentChannel = socket.channel(`room:${roomName}`, {});

  roomNameHeading.innerText = `Active Room: ${roomName}`;

  currentChannel
    .join()
    .receive("ok", (resp) => {
      console.log(`Joined room: ${roomName}`, resp);
      messagesContainer.innerHTML = ""; // Clear messages when switching rooms
    })
    .receive("error", (resp) => {
      console.log(`Unable to join room: ${roomName}`, resp);
    });
  
  // Get all messages from the room
  fetch(`/api/rooms/${roomName}`)
    .then((response) => response.json())
    .then((data) => {
      data.messages.reverse().forEach((message) => {
        let messageItem = document.createElement("p");
        messageItem.innerText = `[Old] ${message}`;
        messagesContainer.appendChild(messageItem);
      });
    }).catch((error) => {
      console.error("Unable to fetch messages", error);
    });

  currentChannel.on("new_msg", (payload) => {
    let messageItem = document.createElement("p");
    messageItem.innerText = `[${new Date().toLocaleTimeString()}] ${
      payload.body
    }`;
    messagesContainer.appendChild(messageItem);
  });
}

// Event listener for chat input
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && currentChannel) {
    console.log("Sending message:", chatInput.value);
    currentChannel.push("new_msg", { body: chatInput.value });
    chatInput.value = "";
  }
});

// Event listener for creating a new room
roomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newRoom = roomInput.value.trim();
  if (newRoom) {
    fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newRoom }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        globalChannel.push("update_room", { body: newRoom });
        fetchRooms();
        roomInput.value = "";
      });
  }
});

// Fetch and display rooms
function fetchRooms() {
  fetch("/api/rooms")
    .then((response) => response.json())
    .then((data) => {
      roomList.innerHTML = "";
      data.rooms.forEach((room) => {
        const roomItem = document.createElement("li");
        roomItem.textContent = room;
        roomItem.classList.add(
          "p-4",
          "bg-gray-700",
          "rounded-lg",
          "shadow",
          "cursor-pointer",
          "hover:bg-blue-500",
          "transition-colors",
          "text-white"
        );

        roomItem.addEventListener("click", () => {
          console.log(`Joining room: ${room}`);
          joinRoom(room);
        });

        roomList.appendChild(roomItem);
      });
    });
}

// Initial room list fetch on page load
fetchRooms();
