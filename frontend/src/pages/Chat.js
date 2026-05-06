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
  const [listingTitle, setListingTitle] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  // prevent self chat
  useEffect(() => {
    if (senderId === receiver) {
      alert("You cannot chat with yourself");
      window.location.href = "/home";
    }
  }, [receiver, senderId]);

  // load messages
  useEffect(() => {
    const markMessagesRead = () => {
      fetch("http://localhost:5001/messages/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: senderId,
          listingId,
          otherUserId: receiver
        })
      });
    };

    fetch(`http://localhost:5001/messages/${listingId}`)
      .then(res => res.json())
      .then(data => {
        // filter messages only between these two users
        const filtered = data.filter(
          msg =>
            (msg.sender_id === senderId && msg.receiver_id === receiver) ||
            (msg.sender_id === receiver && msg.receiver_id === senderId)
        );
        setMessages(filtered);
        markMessagesRead();
      });
  }, [listingId, senderId, receiver]);

  useEffect(() => {
    fetch(`http://localhost:5001/listings/${listingId}`)
      .then(res => res.json())
      .then(data => setListingTitle(data.title || ""));
  }, [listingId]);

  useEffect(() => {
    fetch(`http://localhost:5001/users/${receiver}`)
      .then(res => res.json())
      .then(data => setOtherUser(data));
  }, [receiver]);

  // socket connection
  useEffect(() => {
    const markMessagesRead = () => {
      fetch("http://localhost:5001/messages/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: senderId,
          listingId,
          otherUserId: receiver
        })
      });
    };

    socket.emit("join_chat", { listingId });

    socket.on("receive_message", (msg) => {
      // only add relevant messages
      if (
        (msg.sender_id === senderId && msg.receiver_id === receiver) ||
        (msg.sender_id === receiver && msg.receiver_id === senderId)
      ) {
        setMessages(prev => [...prev, msg]);

        if (msg.receiver_id === senderId) {
          markMessagesRead();
        }
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
        background: "#8e8e8e",
        padding: "10px",
        marginBottom: "10px"
      }}>
        Chat about {listingTitle || `listing #${listingId}`}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
          cursor: otherUser ? "pointer" : "default"
        }}
        onClick={() => {
          if (otherUser?.id) {
            window.location.href = `/user/${otherUser.id}`;
          }
        }}
      >
        <img
          src={otherUser?.avatar_url || "https://via.placeholder.com/44"}
          alt={otherUser?.name || "User"}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />
        <div>
          <div style={{ fontSize: "12px", opacity: 0.7, color: "white" }}>
            Chatting with
          </div>
          <div style={{ color: "#9fd0ff" }}>
            {otherUser?.name || "User"}
          </div>
        </div>
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
