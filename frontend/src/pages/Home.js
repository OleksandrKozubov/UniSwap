import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import ListingCard from "../components/ListingCard";
import locations from "../data/locations";

// Home loads all listings and greets the signed-in user from local storage.
function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    fetch("http://localhost:5001/categories")
      .then(res => res.json())
      .then(data =>
        setCategories(
          Array.isArray(data)
            ? [...data].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
              )
            : []
        )
      )
      .catch(error => {
        console.error(error);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setUnread(0);
      return;
    }

    const loadUnreadCount = () => {
      fetch(`http://localhost:5001/messages/unread/${user.id}`)
        .then(res => res.json())
        .then(data => setUnread(Number(data.count) || 0))
        .catch(error => console.error(error));
    };

    loadUnreadCount();

    const intervalId = window.setInterval(loadUnreadCount, 10000);
    window.addEventListener("focus", loadUnreadCount);
    document.addEventListener("visibilitychange", loadUnreadCount);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadUnreadCount);
      document.removeEventListener("visibilitychange", loadUnreadCount);
    };
  }, [user?.id]);

  // This code was developed with assistance from ChatGPT (GPT-5.5, 2026).
  // Prompt: "Create a React useEffect example that fetches filtered marketplace listings from a REST API endpoint."
  // The generated example was reviewed, modified, and integrated into the UniSwap project.
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (freeOnly) params.append("freeOnly", "true");
    if (user?.id) params.append("userId", user.id);
    params.append("sort", sortBy);

    setIsLoading(true);
    setLoadError("");

    fetch(`http://localhost:5001/listings?${params.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Listings request failed");
        }

        return res.json();
      })
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error(error);
        setLoadError("Listings could not be loaded.");
        setListings([]);
      })
      .finally(() => setIsLoading(false));
  }, [
    search,
    category,
    location,
    minPrice,
    maxPrice,
    freeOnly,
    sortBy,
    user?.id
  ]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setFreeOnly(false);
    setSortBy("newest");
  };

  const handleListingSavedChange = ({ listingId, isSaved, savedCount }) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === listingId
          ? {
              ...listing,
              is_saved: isSaved,
              saved_count: savedCount
            }
          : listing
      )
    );
  };

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="topbar">
          <div className="home-brand">
            <BrandLogo size="large" />
            <div>
              <h1 className="home-title">UniSwap</h1>
              <p className="eyebrow">Marketplace</p>
            </div>
          </div>

          <nav className="topbar-nav" aria-label="Main">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/saved")}
            >
              Saved
            </button>
            <button
              type="button"
              className="btn btn-ghost nav-pill"
              onClick={() => navigate("/chats")}
            >
              Chats
              {unread > 0 && (
                <span className="notification-badge">{unread}</span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/profile")}
            >
              {user?.name ? `Welcome, ${user.name}` : "Profile"}
            </button>
          </nav>
        </header>

        <section className="filter-panel" aria-label="Listing filters">
          <div className="filter-grid">
            <div className="field">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                className="input"
                placeholder="Search listings"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map(categoryOption => (
                  <option key={categoryOption.id} value={categoryOption.id}>
                    {categoryOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                className="select"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                <option value="">All locations</option>
                {locations.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="min-price">Min price</label>
              <input
                id="min-price"
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                disabled={freeOnly}
                onChange={e => setMinPrice(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="max-price">Max price</label>
              <input
                id="max-price"
                className="input"
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                disabled={freeOnly}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="sort">Sort</label>
              <select
                id="sort"
                className="select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
              </select>
            </div>

            <button className="btn btn-secondary" type="button" onClick={resetFilters}>
              Reset
            </button>
            <button
              className={`btn btn-secondary btn-toggle ${
                freeOnly ? "btn-toggle--active" : ""
              }`}
              type="button"
              aria-pressed={freeOnly}
              onClick={() => {
                const nextFreeOnly = !freeOnly;

                setFreeOnly(nextFreeOnly);

                if (nextFreeOnly) {
                  setMinPrice("");
                  setMaxPrice("");
                }
              }}
            >
              Free
            </button>
          </div>
        </section>

        {isLoading && (
          <section className="empty-state" aria-live="polite">
            <h3>Loading listings...</h3>
          </section>
        )}

        {!isLoading && loadError && (
          <section className="empty-state" aria-live="polite">
            <h3>{loadError}</h3>
          </section>
        )}

        {!isLoading && !loadError && listings.length === 0 && (
          <section className="empty-state">
            <h3>No listings found</h3>
          </section>
        )}

        {!isLoading && !loadError && listings.length > 0 && (
          <section className="listing-grid" aria-label="Listings">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={user?.id === listing.user_id}
                currentUserId={user?.id}
                onSavedChange={handleListingSavedChange}
              />
            ))}
          </section>
        )}

        <button
          type="button"
          className="btn btn-primary floating-action"
          onClick={() => navigate("/create")}
        >
          Create listing
        </button>
      </div>
    </main>
  );
}

export default Home;
