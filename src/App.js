import { useState, useEffect } from "react";
import "./App.css";

const typeColors = {
  fire: "type-fire", water: "type-water", grass: "type-grass",
  electric: "type-electric", psychic: "type-psychic", ice: "type-ice",
  dragon: "type-dragon", dark: "type-dark", fairy: "type-fairy",
  normal: "type-normal", fighting: "type-fighting", flying: "type-flying",
  poison: "type-poison", ground: "type-ground", rock: "type-rock",
  bug: "type-bug", ghost: "type-ghost", steel: "type-steel",
};

const statColors = {
  hp: "#e94560", attack: "#ff9f40", defense: "#ffcb05",
  "special-attack": "#c66ce0", "special-defense": "#52d6c0", speed: "#4da6ff",
};

const statNames = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SpA", "special-defense": "SpD", speed: "SPD",
};

const PAGE_SIZE = 20;
const TOTAL = 151;

function App() {
  const [view, setView] = useState("list");
  const [list, setList] = useState([]);
  const [currentPoke, setCurrentPoke] = useState(null);
  const [page, setPage] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (view === "list" && !searchName && !searchId) {
      loadPage(page);
    }
  }, [page]);

  useEffect(() => {
    loadPage(0);
  }, []);

  async function loadPage(p) {
    setLoading(true);
    setError("");
    try {
      const offset = p * PAGE_SIZE;
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = await res.json();
      const details = await Promise.all(
        data.results.map((pk) => fetch(pk.url).then((r) => r.json()))
      );
      setList(
        details.map((pk) => ({
          id: pk.id,
          name: pk.name,
          img:
            pk.sprites.other["official-artwork"].front_default ||
            pk.sprites.front_default,
        }))
      );
    } catch {
      setError("Erro ao carregar Pokémons. Tente novamente.");
    }
    setLoading(false);
  }

  async function fetchPoke(nameOrId) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`
      );
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setCurrentPoke(data);
      setView("detail");
    } catch {
      setError(`Pokémon "${nameOrId}" não encontrado. Verifique o nome ou ID.`);
    }
    setLoading(false);
  }

  function handleBack() {
    setView("list");
    setCurrentPoke(null);
    setSearchName("");
    setSearchId("");
    setPage(0);
    loadPage(0);
  }

  function handleSearchName() {
    const name = searchName.trim().toLowerCase();
    if (!name) { loadPage(0); return; }
    fetchPoke(name);
  }

  function handleSearchId() {
    const id = parseInt(searchId);
    if (!searchId || isNaN(id) || id < 1) {
      alert("Por favor, insira um ID válido (número positivo).");
      return;
    }
    fetchPoke(id);
  }

  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);

  return (
    <div className="pokedex-root">
      <div className="poke-header">
        <div className="poke-title">POKÉDEX</div>
        <div className="poke-subtitle">Pokémon Database</div>
      </div>

      {view === "list" && (
        <>
          <div className="search-area">
            <input
              className="poke-input"
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchName()}
            />
            <button className="btn btn-search" onClick={handleSearchName}>
              Buscar
            </button>
          </div>

          <div className="id-search-row">
            <input
              className="poke-input"
              type="number"
              min="1"
              max="1010"
              placeholder="Buscar por ID (ex: 25)"
              value={searchId}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (e.target.value !== "" && val < 1) setSearchId("1");
                else setSearchId(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearchId()}
            />
            <button className="btn btn-search" onClick={handleSearchId}>
              Buscar ID
            </button>
          </div>

          {loading && <div className="loading-msg">Carregando...</div>}
          {error && <div className="error-msg">{error}</div>}

          {!loading && !error && (
            <>
              <div className="list-grid">
                {list.map((p) => (
                  <div
                    className="mini-card"
                    key={p.id}
                    onClick={() => fetchPoke(p.name)}
                  >
                    <div className="mini-id">#{String(p.id).padStart(3, "0")}</div>
                    <img className="mini-img" src={p.img} alt={p.name} loading="lazy" />
                    <div className="mini-name">{p.name.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {!searchName && !searchId && (
                <div className="nav-dots">
                  <button
                    className="nav-btn"
                    onClick={() => setPage((p) => { const np = p - 1; loadPage(np); return np; })}
                    disabled={page === 0}
                  >
                    ← Anterior
                  </button>
                  <span className="nav-page-info">
                    Pág {page + 1} / {totalPages}
                  </span>
                  <button
                    className="nav-btn"
                    onClick={() => setPage((p) => { const np = p + 1; loadPage(np); return np; })}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {view === "detail" && currentPoke && (
        <>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <button className="btn btn-back" onClick={handleBack}>
              ← Voltar ao início
            </button>
          </div>

          <div className="poke-card">
            <div className="poke-id-badge">
              #{String(currentPoke.id).padStart(3, "0")}
            </div>

            <div className="poke-img-wrap">
              <img
                className="poke-img"
                src={
                  currentPoke.sprites.other["official-artwork"].front_default ||
                  currentPoke.sprites.front_default
                }
                alt={currentPoke.name}
              />
            </div>

            <div className="poke-name">{currentPoke.name.toUpperCase()}</div>

            <div className="poke-types">
              {currentPoke.types.map((t) => (
                <span
                  key={t.type.name}
                  className={`poke-type ${typeColors[t.type.name] || "type-normal"}`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>

            <div className="poke-stats">
              <div className="stat-box">
                <div className="stat-label">Altura</div>
                <div className="stat-value">{(currentPoke.height / 10).toFixed(1)}m</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Peso</div>
                <div className="stat-value">{(currentPoke.weight / 10).toFixed(1)}kg</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Experiência</div>
                <div className="stat-value">{currentPoke.base_experience || "—"}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Habilidades</div>
                <div className="stat-value" style={{ fontSize: "13px" }}>
                  {currentPoke.abilities.slice(0, 2).map((a) => a.ability.name).join(", ")}
                </div>
              </div>
            </div>

            <hr className="divider" />
            <div className="section-title">Status base</div>

            <div className="stat-bar-row">
              {currentPoke.stats.map((s) => {
                const color = statColors[s.stat.name] || "#aaa";
                const pct = Math.min(100, Math.round((s.base_stat / 255) * 100));
                const label = statNames[s.stat.name] || s.stat.name;
                return (
                  <div className="stat-bar-item" key={s.stat.name}>
                    <span className="stat-bar-name">{label}</span>
                    <div className="stat-bar-track">
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="stat-bar-val">{s.base_stat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {view === "detail" && loading && <div className="loading-msg">Carregando...</div>}
      {view === "detail" && error && <div className="error-msg">{error}</div>}
    </div>
  );
}

export default App;