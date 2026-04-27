import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

function Chat() {
  const { listingId, receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const senderId = Number(user.id);
  const receiver = Number(receiverId);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  // prevent self chat
  useEffect(() => {
    if (senderId === receiver) {
      alert("You cannot chat with yourself");
      window.location.href = "/home";
    }
  }, []);

  // load messages
  useEffect(() => {
    fetch(`http://localhost:5001/messages/${listingId}`)
      .then(res => res.json())
      .then(data => {
        // 🔥 filter messages only between these two users
        const filtered = data.filter(
          msg =>
            (msg.sender_id === senderId && msg.receiver_id === receiver) ||
            (msg.sender_id === receiver && msg.receiver_id === senderId)
        );
        setMessages(filtered);
      });
  }, [listingId, senderId, receiver]);

  // socket connection
  useEffect(() => {
    socket.emit("join_chat", { listingId });

    socket.on("receive_message", (msg) => {
      // only add relevant messages
      if (
        (msg.sender_id === senderId && msg.receiver_id === receiver) ||
        (msg.sender_id === receiver && msg.receiver_id === senderId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => socket.off("receive_message");
  }, [listingId, senderId, receiver]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send_message", {
      senderId: senderId,
      receiverId: receiver,
      listingId: Number(listingId),
      text
    });

    setText("");
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* BACK */}
      <button onClick={() => window.location.href = "/chats"}>
        Back
      </button>

      {/* LISTING BANNER (basic for now) */}
      <div style={{
        background: "#333",
        padding: "10px",
        marginBottom: "10px"
      }}>
        Chat about listing #{listingId}
      </div>

      {/* MESSAGES */}
      <div style={{
        height: "350px",
        overflowY: "scroll",
        padding: "10px",
        background: "#1a1a1a"
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent:
                msg.sender_id === senderId ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              background:
                msg.sender_id === senderId ? "#4CAF50" : "#333",
              padding: "10px",
              borderRadius: "10px",
              margin: "5px",
              maxWidth: "60%",
              color: "white"
            }}>
              {msg.text}

              <div style={{
                fontSize: "10px",
                opacity: 0.6,
                marginTop: "5px"
              }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ marginTop: "10px" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ width: "70%", padding: "8px" }}
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>

    </div>
  );
}

export default Chat;