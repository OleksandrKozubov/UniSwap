import { useEffect, useState } from "react";

function Chats() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = Number(user?.id);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadChats = () => {
      fetch(`http://localhost:5001/chats/${userId}`)
        .then(res => res.json())
        .then(data => setChats(data));
    };

    loadChats();

    const intervalId = window.setInterval(loadChats, 10000);
    window.addEventListener("focus", loadChats);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadChats);
    };
  }, [userId]);

  return (
    <div style={{ padding: "20px" }}>

      {/* BACK BUTTON */}
      <button onClick={() => window.location.href = "/home"}>
        Back
      </button>

      <h2>Your Chats</h2>

      {chats.map(chat => {
        const unreadCount = Number(chat.unread_count) || 0;

        return (
          <div
            key={chat.listing_id + "_" + chat.other_user_id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px"
            }}
            onClick={() =>
              window.location.href = `/chat/${chat.listing_id}/${chat.other_user_id}`
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={chat.other_user_avatar_url || "https://via.placeholder.com/40"}
                alt={chat.other_user_name || "User"}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
              <div>
              <div>
                Chat about {chat.listing_title || `listing #${chat.listing_id}`}
              </div>
              <div style={{
                fontSize: "12px",
                opacity: 0.7,
                marginTop: "4px"
              }}>
                {chat.other_user_name || "User"} · Listing #{chat.listing_id}
              </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <span style={{
                minWidth: "24px",
                height: "24px",
                borderRadius: "999px",
                backgroundColor: "red",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 8px"
              }}>
                {unreadCount}
              </span>
            )}
          </div>
        );
      })}

    </div>
  );
}

export default Chats;
