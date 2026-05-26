import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarPlaceholder } from "../utils/avatar";

function Chats() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = Number(user?.id);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const loadChats = () => {
      setLoadError("");

      fetch(`http://localhost:5001/chats/${userId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Chats request failed");
          }

          return res.json();
        })
        .then(data => setChats(Array.isArray(data) ? data : []))
        .catch(error => {
          console.error(error);
          setLoadError("Chats could not be loaded.");
          setChats([]);
        })
        .finally(() => setIsLoading(false));
    };

    loadChats();

    const intervalId = window.setInterval(loadChats, 10000);
    window.addEventListener("focus", loadChats);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadChats);
    };
  }, [navigate, userId]);

  if (!userId) {
    return <div className="loading-state">Loading chats...</div>;
  }

  return (
    <main className="app-shell">
      <div className="app-container app-container--narrow">
        <header className="page-header">
          <div>
            <p className="eyebrow">Messages</p>
            <h1 className="page-title">Your chats</h1>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        {isLoading && (
          <section className="empty-state" aria-live="polite">
            <h3>Loading chats...</h3>
            <p>Checking your latest conversations.</p>
          </section>
        )}

        {!isLoading && loadError && (
          <section className="empty-state" aria-live="polite">
            <h3>{loadError}</h3>
            <p>Check that the backend is running on port 5001.</p>
          </section>
        )}

        {!isLoading && !loadError && chats.length === 0 && (
          <section className="empty-state">
            <h3>No conversations yet</h3>
            <p>Contact a seller from a listing to start a chat.</p>
          </section>
        )}

        {!isLoading && !loadError && chats.length > 0 && (
          <section className="chat-list" aria-label="Chat list">
            {chats.map(chat => {
              const unreadCount = Number(chat.unread_count) || 0;
              const otherUserName = chat.other_user_name || "User";
              const avatarUrl =
                chat.other_user_avatar_url ||
                getAvatarPlaceholder(otherUserName);

              return (
                <button
                  key={chat.listing_id + "_" + chat.other_user_id}
                  type="button"
                  className="chat-list-item"
                  onClick={() =>
                    navigate(`/chat/${chat.listing_id}/${chat.other_user_id}`)
                  }
                >
                  <span className="chat-user">
                    <img
                      className="avatar"
                      src={avatarUrl}
                      alt={otherUserName}
                      onError={event => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getAvatarPlaceholder(otherUserName);
                      }}
                    />
                    <span>
                      <span className="chat-title">
                        Chat about {chat.listing_title || `listing #${chat.listing_id}`}
                      </span>
                      <span className="chat-meta">
                        {otherUserName} - Listing #{chat.listing_id}
                      </span>
                    </span>
                  </span>

                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default Chats;
