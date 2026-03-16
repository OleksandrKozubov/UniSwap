import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/listings")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  return (
    <div>
      <h1>UniSwap Listings</h1>

      {items.map(item => (
        <div key={item.id}>
          {item.title} - ${item.price}
        </div>
      ))}

    </div>
  );
}

export default App;