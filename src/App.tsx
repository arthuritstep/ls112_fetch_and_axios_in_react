import { useEffect, useState } from "react";
import "./styles.css";

type Cat = {
  id: string;
  url: string;
};

const API_URL = "https://api.thecatapi.com/v1/images/search";

async function fetchRandomCat(): Promise<Cat> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Не удалось загрузить котика");
  }

  const data: Cat[] = await response.json();

  if (!data.length) {
    throw new Error("Картинка не найдена");
  }

  return data[0];
}

function App() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Cat[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFirstCat = async () => {
      setLoading(true);
      setError("");

      try {
        const newCat = await fetchRandomCat();

        if (active) {
          setCat(newCat);
        }
      } catch {
        if (active) {
          setError("Не удалось загрузить котика. Попробуйте ещё раз.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFirstCat();

    return () => {
      active = false;
    };
  }, []);

  const handleNewCat = async () => {
    if (loading) return;

    setLoading(true);
    setError("");
    setShowFavorites(false);

    try {
      const newCat = await fetchRandomCat();
      setCat(newCat);
    } catch {
      setError("Не удалось загрузить котика. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (selectedCat: Cat) => {
    setFavorites((previousFavorites) => {
      const alreadyFavorite = previousFavorites.some(
        (item) => item.id === selectedCat.id
      );

      if (alreadyFavorite) {
        return previousFavorites.filter(
          (item) => item.id !== selectedCat.id
        );
      }

      return [...previousFavorites, selectedCat];
    });
  };

  const isFavorite = cat
    ? favorites.some((item) => item.id === cat.id)
    : false;

  return (
    <main className="app">
      <header className="header">
        <div className="logo">🐱 Random Cat</div>
        <p>твоя ежедневная порция милоты</p>
      </header>

      <section className="cat-card">
        <div className="card-heading">
          <span className="eyebrow">CAT OF THE MOMENT</span>
          <span className="paw">🐾</span>
        </div>

        <h1>Случайный котик</h1>
        <p className="subtitle">
          каждый котик особенный. Посмотри, кто попадётся тебе
        </p>

        <div className="image-container">
          {loading && (
            <div className="image-placeholder">
              <div className="spinner"></div>
              <p>Ищем котика...</p>
            </div>
          )}

          {!loading && cat && (
            <img
              className="cat-image"
              src={cat.url}
              alt="Случайный котик"
            />
          )}

          {!loading && !cat && error && (
            <div className="image-placeholder">
              <span className="error-icon">😿</span>
              <p>котик пока не появился</p>
            </div>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="actions">
          <button
            className="new-cat-button"
            onClick={handleNewCat}
            disabled={loading}
          >
            {loading ? "Загрузка..." : "новый кот"}
          </button>

          <button
            className={`favorite-button ${isFavorite ? "favorited" : ""}`}
            onClick={() => cat && toggleFavorite(cat)}
            disabled={!cat || loading}
          >
            {isFavorite ? "❤️ В избранном" : "♡ В избранное"}
          </button>
        </div>

        <div className="divider"></div>

        <button
          className="favorites-toggle"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          ❤️ Избранные котики ({favorites.length})
          <span>{showFavorites ? "▲" : "▼"}</span>
        </button>

        {showFavorites && (
          <div className="favorites-section">
            {favorites.length === 0 ? (
              <p className="empty-favorites">
                пока никого нет. Добавь первого кота в избранное
              </p>
            ) : (
              <div className="favorites-grid">
                {favorites.map((favorite) => (
                  <div className="favorite-card" key={favorite.id}>
                    <img src={favorite.url} alt="Кот в избранном" />

                    <button
                      className="remove-favorite"
                      onClick={() => toggleFavorite(favorite)}
                      aria-label="удалить из избранного"
                      title="удалить из избранного"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="footer-note">
          сделано с ❤️ для любителей котиков
        </p>
      </section>
    </main>
  );
}

export default App;
