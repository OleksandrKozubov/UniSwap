import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { getAvatarPlaceholder } from "../utils/avatar";

const socket = io("http://localhost:5001");

function formatMessageTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function Chat() {
  const { listingId, receiverId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const senderId = Number(user?.id);
  const receiver = Number(receiverId);

  const [messages, setMessages] = useState([]);
  const [listingTitle, setListingTitle] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState("");
  const [loadError, setLoadError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!senderId) {
      navigate("/login");
    }
  }, [navigate, senderId]);

  useEffect(() => {
    if (!senderId) {
      return;
    }

    if (senderId === receiver) {
      alert("You cannot chat with yourself");
      navigate("/home");
    }
  }, [navigate, receiver, senderId]);

  useEffect(() => {
    if (!senderId) {
      return;
    }

    const markMessagesRead = () => {
      fetch("http://localhost:5001/messages/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: senderId,
          listingId,
          otherUserId: receiver
        })
      }).catch(error => console.error(error));
    };

    fetch(`http://localhost:5001/messages/${listingId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Messages request failed");
        }

        return res.json();
      })
      .then(data => {
        const filtered = data.filter(
          msg =>
            (msg.sender_id === senderId && msg.receiver_id === receiver) ||
            (msg.sender_id === receiver && msg.receiver_id === senderId)
        );
        setMessages(filtered);
        markMessagesRead();
      })
      .catch(error => {
        console.error(error);
        setLoadError("Messages could not be loaded.");
      });
  }, [listingId, senderId, receiver]);

  useEffect(() => {
    fetch(`http://localhost:5001/listings/${listingId}`)
      .then(res => res.json())
      .then(data => setListingTitle(data.title || ""))
      .catch(error => console.error(error));
  }, [listingId]);

  useEffect(() => {
    fetch(`http://localhost:5001/users/${receiver}`)
      .then(res => res.json())
      .then(data => setOtherUser(data))
      .catch(error => console.error(error));
  }, [receiver]);

  useEffect(() => {
    if (!senderId) {
      return;
    }

    const markMessagesRead = () => {
      fetch("http://localhost:5001/messages/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: senderId,
          listingId,
          otherUserId: receiver
        })
      }).catch(error => console.error(error));
    };

    const receiveMessage = msg => {
      if (
        (msg.sender_id === senderId && msg.receiver_id === receiver) ||
        (msg.sender_id === receiver && msg.receiver_id === senderId)
      ) {
        setMessages(prev => [...prev, msg]);

        if (msg.receiver_id === senderId) {
          markMessagesRead();
        }
      }
    };

    socket.emit("join_chat", { listingId });
    socket.on("receive_message", receiveMessage);

    return () => socket.off("receive_message", receiveMessage);
  }, [listingId, senderId, receiver]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = event => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || !senderId) {
      return;
    }

    socket.emit("send_message", {
      senderId,
      receiverId: receiver,
      listingId: Number(listingId),
      text: trimmedText
    });

    setText("");
  };

  if (!senderId) {
    return <div className="loading-state">Loading chat...</div>;
  }

  const otherUserName = otherUser?.name || "User";
  const otherUserAvatar =
    otherUser?.avatar_url || getAvatarPlaceholder(otherUserName);

  return (
    <main className="chat-shell">
      <header className="chat-header">
        <section className="chat-banner">
          <div>
            <p className="eyebrow">Conversation</p>
            <h1 className="section-title">
              Chat about {listingTitle || `listing #${listingId}`}
            </h1>
          </div>

          <div className="chat-banner-actions">
            <button
              type="button"
              className="seller-row seller-button"
              onClick={() => {
                if (otherUser?.id) {
                  navigate(`/user/${otherUser.id}`);
                }
              }}
            >
              <img
                className="avatar"
                src={otherUserAvatar}
                alt={otherUserName}
                onError={event => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getAvatarPlaceholder(otherUserName);
                }}
              />
              <span>
                <span className="muted">With</span>{" "}
                <span className="seller-name">{otherUserName}</span>
              </span>
            </button>

            <button className="btn btn-secondary" type="button" onClick={() => navigate("/chats")}>
              Back
            </button>
          </div>
        </section>
      </header>

      <section className="chat-window" aria-live="polite">
        {loadError && (
          <div className="empty-state">
            <h3>{loadError}</h3>
          </div>
        )}

        {!loadError && messages.length === 0 && (
          <div className="empty-state">
            <h3>No messages yet</h3>
          </div>
        )}

        {!loadError && messages.map((msg, index) => {
          const isSent = msg.sender_id === senderId;
          const time = formatMessageTime(msg.created_at);

          return (
            <div
              className={`message-row ${
                isSent ? "message-row--sent" : "message-row--received"
              }`}
              key={msg.id || `${msg.sender_id}-${msg.created_at}-${index}`}
            >
              <div className="message-bubble">
                {msg.text}
                {time && <div className="message-time">{time}</div>}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </section>

      <form className="chat-composer" onSubmit={sendMessage}>
        <input
          className="input"
          value={text}
          placeholder="Write a message"
          onChange={e => setText(e.target.value)}
        />

        <button className="btn btn-primary" type="submit">
          Send
        </button>
      </form>
    </main>
  );
}

export default Chat;
