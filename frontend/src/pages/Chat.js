import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

function Chat() {
  const { listingId, receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // load messages
  useEffect(() => {
    fetch(`http://localhost:5001/messages/${listingId}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [listingId]);

  // socket join
  useEffect(() => {
    socket.emit("join_chat", { listingId });

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, [listingId]);

const sendMessage = () => {
  if (!text) return;

  socket.emit("send_message", {
    senderId: user.id,
    receiverId,
    listingId,
    text
  });

  setText("");
};

return (
  <div style={{ padding: "20px" }}>

    {/* 🔥 LISTING BANNER */}
    <div style={{
      background: "#333",
      padding: "10px",
      marginBottom: "10px"
    }}>
      Chat about listing #{listingId}
    </div>

    {/* MESSAGES */}
    <div style={{ height: "300px", overflowY: "scroll" }}>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>
            {msg.sender_id === user.id ? "You" : "Them"}:
          </strong>
          {msg.text}

          <div style={{ fontSize: "10px", opacity: 0.6 }}>
            {new Date(msg.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>

    {/* INPUT */}
    <input
      value={text}
      onChange={e => setText(e.target.value)}
    />

    <button onClick={sendMessage}>Send</button>

  </div>
);
}

export default Chat;