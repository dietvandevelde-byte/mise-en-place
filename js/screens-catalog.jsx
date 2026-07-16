/* =========================================================================
   MEAL PLANNER — Receptencatalogus (gedeelde bibliotheek)
   ========================================================================= */
function CatalogScreen({ toast, onClose }) {
  useStore(); // re-render wanneer store wijzigt (adoptedIds up-to-date houden)
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterCuisine, setFilterCuisine] = useState(null);
  const [filterHealthy, setFilterHealthy] = useState(false);
  const [adoptingId, setAdoptingId] = useState(null);

  const isAdmin = !!(window.MPAPI && window.MPAPI.user && window.MPAPI.user.is_admin);
  const adoptedIds = new Set(window.MP.RECIPES.filter(r => r._catalogId).map(r => r._catalogId));

  React.useEffect(() => {
    if (!window.MPAPI) { setLoading(false); return; }
    window.MPAPI.loadCatalog()
      .then(list => setCatalog(list || []))
      .catch(() => toast && toast("Kon catalogus niet laden"))
      .finally(() => setLoading(false));
  }, []);

  const cuisines = [...new Set(catalog.map(r => r.cuisine).filter(Boolean))].sort();

  const filtered = catalog.filter(r => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterCuisine && r.cuisine !== filterCuisine) return false;
    if (filterHealthy && !r.is_healthy) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "nl"));

  async function adopt(recipe) {
    setAdoptingId(recipe.id);
    try {
      await window.MPAPI.adoptCatalogRecipe(recipe.id);
      await window.MPAPI.loadUserRecipes();
      window.MPStore.touch();
      toast && toast(`${recipe.name} toegevoegd aan je recepten`);
    } catch (e) {
      toast && toast("Fout: " + e.message);
    } finally {
      setAdoptingId(null);
    }
  }

  async function removeFromCatalog(recipe) {
    if (!window.confirm(`"${recipe.name}" verwijderen uit de catalogus?`)) return;
    try {
      await window.MPAPI.deleteCatalogRecipe(recipe.id);
      setCatalog(c => c.filter(r => r.id !== recipe.id));
      toast && toast("Verwijderd uit catalogus");
    } catch (e) {
      toast && toast("Fout: " + e.message);
    }
  }

  const filterBar = React.createElement(React.Fragment, null,
    React.createElement("div", { className: "picker__search", style: { marginBottom: 10 } },
      React.createElement(Icon, { name: "search", size: 18 }),
      React.createElement("input", { className: "input", placeholder: "Zoek op naam…", value: q, onChange: e => setQ(e.target.value) })),
    cuisines.length > 0 && React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      React.createElement("button", { className: "chip", "data-active": !filterCuisine ? 1 : 0, onClick: () => setFilterCuisine(null) }, "Alle"),
      cuisines.map(c => React.createElement("button", { key: c, className: "chip", "data-active": filterCuisine === c ? 1 : 0, onClick: () => setFilterCuisine(filterCuisine === c ? null : c) }, c))),
    React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } },
      React.createElement("button", { className: "chip", "data-active": filterHealthy ? 1 : 0, onClick: () => setFilterHealthy(v => !v) },
        React.createElement(Icon, { name: "leaf", size: 13 }), " Gezond"),
      React.createElement("span", { style: { fontSize: 12, color: "var(--ink-3)", alignSelf: "center" } },
        filtered.length, " van de ", catalog.length, " recepten")));

  let body;
  if (loading) {
    body = React.createElement("div", { style: { textAlign: "center", padding: "40px 0", color: "var(--ink-3)", fontSize: 14 } }, "Catalogus laden…");
  } else if (catalog.length === 0) {
    body = React.createElement("div", { className: "empty" },
      React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "book", size: 26 })),
      React.createElement("div", { className: "empty__title" }, "Catalogus is nog leeg"),
      isAdmin && React.createElement("div", null, "Importeer recepten via het receptenscherm en gebruik 'Naar catalogus' om ze hier toe te voegen."));
  } else if (filtered.length === 0) {
    body = React.createElement("div", { className: "empty" },
      React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "search", size: 26 })),
      React.createElement("div", { className: "empty__title" }, "Niets gevonden"),
      React.createElement("div", null, "Pas je zoekterm of filter aan."));
  } else {
    body = React.createElement("div", { className: "catgrid" },
      filtered.map(recipe => {
        const adopted = adoptedIds.has(recipe.id);
        const isAdopting = adoptingId === recipe.id;
        return React.createElement("div", { key: recipe.id, className: "catcard" },
          recipe.image_url
            ? React.createElement("div", { className: "catcard__thumb" }, React.createElement("img", { src: recipe.image_url, alt: "" }))
            : React.createElement("div", { className: "catcard__thumb catcard__thumb--empty" },
                React.createElement(Icon, { name: "book", size: 22 })),
          React.createElement("div", { className: "catcard__body" },
            React.createElement("div", { className: "catcard__name" }, recipe.name),
            React.createElement("div", { className: "catcard__meta" },
              recipe.cuisine && React.createElement("span", { className: "tag" }, recipe.cuisine),
              recipe.is_healthy && React.createElement("span", { className: "tag", style: { background: "var(--sage-soft)", color: "var(--sage-ink)" } },
                React.createElement(Icon, { name: "leaf", size: 11 }), " Gezond"),
              recipe.prep_time && React.createElement("span", { className: "tag" },
                React.createElement(Icon, { name: "clock", size: 11 }), " ", recipe.prep_time, " min"),
              recipe.kcal && React.createElement("span", { className: "tag" }, recipe.kcal, " kcal")),
            React.createElement("div", { className: "catcard__foot" },
              adopted
                ? React.createElement("div", { style: { fontSize: 12, color: "var(--brand)", fontWeight: 700 } },
                    React.createElement(Icon, { name: "check", size: 13 }), " Al in je recepten")
                : React.createElement("button", {
                    className: "btn btn--sm btn--block",
                    disabled: isAdopting,
                    onClick: () => adopt(recipe),
                  }, isAdopting ? "…" : React.createElement(React.Fragment, null, React.createElement(Icon, { name: "plus", size: 14 }), " Voeg toe")),
              isAdmin && React.createElement("button", {
                className: "btn btn--ghost btn--sm",
                style: { color: "var(--red, #C0392B)", marginTop: 6, width: "100%" },
                onClick: () => removeFromCatalog(recipe),
              }, React.createElement(Icon, { name: "trash", size: 13 }), " Verwijder"))));
      }));
  }

  return React.createElement(Sheet, {
    eyebrow: "Recepten ontdekken",
    eyebrowColor: "teal",
    title: "Catalogus",
    onClose,
    wide: true,
  }, filterBar, body);
}
window.CatalogScreen = CatalogScreen;
