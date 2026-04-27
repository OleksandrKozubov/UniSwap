import { useEffect, useState } from "react";

function Chats() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5001/chats/${user.id}`)
      .then(res => res.json())
      .then(data => setChats(data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔙 BACK BUTTON */}
      <button onClick={() => window.location.href = "/home"}>
        Back
      </button>

      <h2>Your Chats</h2>

      {chats.map(chat => {
        const otherUserId =
          chat.sender_id === user.id
            ? chat.receiver_id
            : chat.sender_id;

        return (
          <div
            key={chat.listing_id + "_" + otherUserId}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer"
            }}
            onClick={() =>
              window.location.href = `/chat/${chat.listing_id}/${otherUserId}`
            }
          >
            Chat about listing #{chat.listing_id}
          </div>
        );
      })}

    </div>
  );
}

export default Chats;