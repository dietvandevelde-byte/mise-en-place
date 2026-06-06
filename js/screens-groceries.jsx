/* =========================================================================
   MEAL PLANNER — Groceries screen
   ========================================================================= */
function GroceriesScreen({ layout, toast, openShare }) {
  const state = useStore();
  const groups = S.sel.groceries();
  const stats = S.sel.groceryStats();
  const pct = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const AISLES = window.MP.AISLES;

  const [name, setName] = useState("");
  const [cat, setCat] = useState("Voorraad");
  const gdays = S.sel.days();
  const goffset = state.weekOffset || 0;
  const grel = goffset === 0 ? "deze week" : goffset === 1 ? "volgende week" : goffset === -1 ? "vorige week" : goffset > 1 ? `over ${goffset} weken` : `${-goffset} weken geleden`;

  function addItem() {
    if (!name.trim()) return;
    S.actions.addManual(name.trim(), cat);
    toast(`${name.trim()} toegevoegd`);
    setName("");
  }

  // horizontal add bar for the desktop top
  const addBar = React.createElement("div", { className: "grocadd" },
    React.createElement(Icon, { name: "plus", size: 18 }),
    React.createElement("input", { className: "input grocadd__name", placeholder: "Zelf iets toevoegen \u2014 bv. tandpasta", value: name, onChange: (e) => setName(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") addItem(); } }),
    React.createElement("select", { className: "input grocadd__cat", value: cat, onChange: (e) => setCat(e.target.value) },
      AISLES.map((a) => React.createElement("option", { key: a.key, value: a.key }, a.name))),
    React.createElement("button", { className: "btn", onClick: addItem, disabled: !name.trim() }, React.createElement(Icon, { name: "plus", size: 17 }), "Toevoegen"),
    stats.done > 0 && React.createElement("button", { className: "btn btn--ghost", onClick: () => { S.actions.uncheckAllGroceries(); toast("Lijst hersteld"); } }, React.createElement(Icon, { name: "swap", size: 16 }), "Alles terugzetten")
  );

  const progress = React.createElement("div", { className: "groc__progress" },
    React.createElement("div", { className: "groc__progress-top" },
      React.createElement("div", null,
        React.createElement("div", { className: "t-eyebrow" }, "Afgevinkt"),
        React.createElement("div", { className: "groc__progress-num" }, stats.done, React.createElement("span", null, " / ", stats.total))),
      React.createElement("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: 28, color: pct === 100 ? "var(--brand)" : "var(--ink)" } }, pct, "%")),
    React.createElement("div", { className: "groc__progress-bar" }, React.createElement("div", { className: "groc__progress-fill", style: { width: pct + "%" } })),
    stats.done > 0 && React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginTop: 12, width: "100%" }, onClick: () => { S.actions.uncheckAllGroceries(); toast("Lijst hersteld"); } }, "Alles terugzetten")
  );

  const addCard = React.createElement("div", { className: "card", style: { padding: 16 } },
    React.createElement("div", { className: "section-label", style: { marginBottom: 10 } }, "Zelf toevoegen"),
    React.createElement("input", { className: "input", placeholder: "bv. Tandpasta", value: name, onChange: (e) => setName(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") addItem(); } }),
    React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
      React.createElement("select", { className: "input", value: cat, onChange: (e) => setCat(e.target.value), style: { flex: 1 } },
        AISLES.map((a) => React.createElement("option", { key: a.key, value: a.key }, a.name))),
      React.createElement("button", { className: "btn", onClick: addItem, disabled: !name.trim() }, React.createElement(Icon, { name: "plus", size: 18 }))),
    stats.done > 0 && React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginTop: 10, width: "100%" }, onClick: () => { S.actions.uncheckAllGroceries(); toast("Lijst hersteld"); } }, React.createElement(Icon, { name: "swap", size: 15 }), "Alles terugzetten (", stats.done, ")")
  );

  const aisles = React.createElement("div", { className: layout === "desktop" && groups.length > 0 ? "aislewrap aislewrap--cols" : "aislewrap" },
    groups.length === 0 && React.createElement("div", { className: "empty" },
      React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "cart", size: 26 })),
      React.createElement("div", { className: "empty__title" }, "Nog niets voor ", grel),
      React.createElement("div", null, "Er zijn geen maaltijden gepland voor ", S.fmt.fmtDay(gdays[0]), " ", S.fmt.fmtMon(gdays[0]), " – ", S.fmt.fmtDay(gdays[6]), " ", S.fmt.fmtMon(gdays[6]), "."),
      goffset !== 0 && React.createElement("button", { className: "btn btn--soft", style: { marginTop: 16 }, onClick: () => S.actions.gotoCurrentWeek() }, React.createElement(Icon, { name: "today", size: 17 }), "Naar deze week")),
    groups.map((g) => React.createElement("div", { key: g.cat, className: "aisle", "data-c": (S.sel.aisleMeta(g.cat) || {}).color || "brand" },
      React.createElement("div", { className: "aisle__head" },
        React.createElement("span", { className: "aisle__dot" }),
        React.createElement("div", { className: "aisle__name" }, g.name),
        React.createElement("div", { className: "aisle__count" }, g.items.filter((i) => i.checked).length, "/", g.items.length)),
      g.items.map((it) => React.createElement("div", { key: it.key, className: "gitem", "data-on": it.checked ? 1 : 0, onClick: () => S.actions.toggleGrocery(it.key) },
        React.createElement("div", { className: "gcheck" }, React.createElement(Icon, { name: "check", size: 15 })),
        React.createElement("div", { className: "gitem__body" },
          React.createElement("div", { className: "gitem__name" }, it.name),
          React.createElement("div", { className: "gitem__sub" },
            it.manual
              ? React.createElement("span", { className: "gitem__manual" }, "Zelf toegevoegd")
              : it.recipeCount > 1 ? `uit ${it.recipeCount} recepten` : "uit 1 recept")),
        it.qty != null && React.createElement("div", { className: "gitem__qty" }, fmtQty(it.qty, it.unit)),
        it.manual && React.createElement("button", { className: "gitem__del", onClick: (e) => { e.stopPropagation(); S.actions.removeManual(it.manualId); } }, React.createElement(Icon, { name: "trash", size: 16 }))
      ))
    ))
  );

  return React.createElement("div", { className: "wrap screen-anim" },
    React.createElement("div", { className: "shead" },
      React.createElement("div", null,
        React.createElement("h1", { className: "shead__title" }, "Boodschappen"),
        React.createElement("div", { className: "shead__sub" }, "Samengevoegd uit je weekplanning · gesorteerd op schap")),
      React.createElement("div", { className: "weeknav" },
        React.createElement("button", { className: "sharetrigger", onClick: () => openShare && openShare("groceries"), title: "Boodschappenlijst delen" },
          React.createElement(Icon, { name: "share", size: 15 }), "Deel"),
        React.createElement("button", { className: "weeknav__btn", onClick: () => S.actions.shiftWeek(-1), title: "Vorige week", "aria-label": "Vorige week" },
          React.createElement(Icon, { name: "chevL", size: 18 })),
        React.createElement("div", { className: "weeknav__label", onClick: () => goffset !== 0 && S.actions.gotoCurrentWeek(), "data-now": goffset === 0 ? 1 : 0 },
          React.createElement("span", { className: "weeknav__rel" }, cap(grel)),
          React.createElement("span", { className: goffset === 0 ? "weeknav__sub" : "weeknav__back" }, goffset === 0 ? (S.fmt.fmtDay(gdays[0]) + " " + S.fmt.fmtMon(gdays[0]) + " – " + S.fmt.fmtDay(gdays[6]) + " " + S.fmt.fmtMon(gdays[6])) : "ga naar nu")),
        React.createElement("button", { className: "weeknav__btn", onClick: () => S.actions.shiftWeek(1), title: "Volgende week", "aria-label": "Volgende week" },
          React.createElement(Icon, { name: "chevR", size: 18 })))),
    layout === "desktop"
      ? React.createElement("div", { className: "groc groc--desktop" },
          addBar,
          aisles)
      : React.createElement("div", { className: "groc" },
          addCard,
          aisles)
  );
}
window.GroceriesScreen = GroceriesScreen;
