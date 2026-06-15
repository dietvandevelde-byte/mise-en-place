/* =========================================================================
   MEAL PLANNER — Groceries screen
   ========================================================================= */
function GroceriesScreen({ layout, toast, openShare }) {
  const state = useStore();
  const hs = state.householdSize || 1;
  const groups = S.sel.groceries();
  const stats = S.sel.groceryStats();
  const pct = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const AISLES = window.MP.AISLES;

  const [name, setName] = useState("");
  const [cat, setCat] = useState("Voorraad");
  const [editingItem, setEditingItem] = useState(null); // key of item being qty-edited
  const [hideChecked, setHideChecked] = useState(false);
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
    stats.done > 0 && React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", "data-active": hideChecked ? 1 : 0, onClick: () => setHideChecked((h) => !h) },
        React.createElement(Icon, { name: hideChecked ? "eye" : "eyeOff", size: 16 }),
        hideChecked ? `Toon afgevinkte (${stats.done})` : "Verberg afgevinkte"),
      React.createElement("button", { className: "btn btn--ghost", onClick: () => { S.actions.uncheckAllGroceries(); setHideChecked(false); toast("Lijst hersteld"); } },
        React.createElement(Icon, { name: "swap", size: 16 }), "Terugzetten"))
  );

  const progress = React.createElement("div", { className: "groc__progress" },
    React.createElement("div", { className: "groc__progress-top" },
      React.createElement("div", null,
        React.createElement("div", { className: "t-eyebrow" }, "Afgevinkt"),
        React.createElement("div", { className: "groc__progress-num" }, stats.done, React.createElement("span", null, " / ", stats.total))),
      React.createElement("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: 28, color: pct === 100 ? "var(--brand)" : "var(--ink)" } }, pct, "%")),
    React.createElement("div", { className: "groc__progress-bar" }, React.createElement("div", { className: "groc__progress-fill", style: { width: pct + "%" } })),
    stats.done > 0 && React.createElement("div", { style: { marginTop: 12, display: "flex", gap: 8 } },
      React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, "data-active": hideChecked ? 1 : 0, onClick: () => setHideChecked((h) => !h) },
        React.createElement(Icon, { name: hideChecked ? "eye" : "eyeOff", size: 14 }),
        hideChecked ? "Toon" : "Verberg"),
      React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => { S.actions.uncheckAllGroceries(); setHideChecked(false); toast("Lijst hersteld"); } },
        React.createElement(Icon, { name: "swap", size: 14 }), "Terugzetten"))
  );

  const addCard = React.createElement("div", { className: "card", style: { padding: 16 } },
    React.createElement("div", { className: "section-label", style: { marginBottom: 10 } }, "Zelf toevoegen"),
    React.createElement("input", { className: "input", placeholder: "bv. Tandpasta", value: name, onChange: (e) => setName(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") addItem(); } }),
    React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
      React.createElement("select", { className: "input", value: cat, onChange: (e) => setCat(e.target.value), style: { flex: 1 } },
        AISLES.map((a) => React.createElement("option", { key: a.key, value: a.key }, a.name))),
      React.createElement("button", { className: "btn", onClick: addItem, disabled: !name.trim() }, React.createElement(Icon, { name: "plus", size: 18 }))),
    stats.done > 0 && React.createElement("div", { style: { marginTop: 10, display: "flex", gap: 8 } },
      React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, "data-active": hideChecked ? 1 : 0, onClick: () => setHideChecked((h) => !h) },
        React.createElement(Icon, { name: hideChecked ? "eye" : "eyeOff", size: 14 }),
        hideChecked ? `Toon (${stats.done})` : "Verberg afgevinkte"),
      React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => { S.actions.uncheckAllGroceries(); setHideChecked(false); toast("Lijst hersteld"); } },
        React.createElement(Icon, { name: "swap", size: 14 }), "Terugzetten"))
  );

  function renderGItem(it, gridCol) {
    const isEditing = editingItem === it.key;
    const colStyle = gridCol ? { gridColumn: gridCol } : undefined;
    const compact = !!gridCol;
    const qtyDisplay = it.qtyNote || (it.qty != null && it.qty > 0 ? fmtQty(it.qty, it.unit) : null);
    return React.createElement("div", { key: it.key, className: "gitem", "data-on": it.checked ? 1 : 0, style: colStyle },
      React.createElement("div", { className: "gcheck", onClick: () => S.actions.toggleGrocery(it.key) }, React.createElement(Icon, { name: "check", size: 15 })),
      React.createElement("div", { className: "gitem__body", onClick: () => setEditingItem(isEditing ? null : it.key) },
        React.createElement("div", { className: "gitem__name" }, it.name),
        isEditing
          ? React.createElement("input", {
              className: "gitem__qtyinput",
              placeholder: it.qty > 0 ? fmtQty(it.qty, it.unit) : "Hoeveelheid",
              value: it.qtyNote || "",
              onChange: (ev) => it.manual
                ? S.actions.updateManual(it.manualId, { qtyNote: ev.target.value })
                : S.actions.setGroceryNote(it.key, ev.target.value),
              onClick: (ev) => ev.stopPropagation(),
              onBlur: () => setEditingItem(null),
              autoFocus: true,
              style: { marginTop: 4 },
            })
          : !compact && React.createElement("div", { className: "gitem__sub" },
              it.manual
                ? React.createElement("span", { className: "gitem__manual" }, "Zelf toegevoegd")
                : (it.recipeCount > 1 ? `uit ${it.recipeCount} recepten` : "uit 1 recept"))),
      !isEditing && qtyDisplay && React.createElement("div", { className: "gitem__qty" }, qtyDisplay),
      isEditing && it.manual && React.createElement("button", { className: "gitem__del", onMouseDown: (e) => e.preventDefault(), onClick: (e) => { e.stopPropagation(); S.actions.removeManual(it.manualId); setEditingItem(null); } }, React.createElement(Icon, { name: "trash", size: 16 })));
  }

  function renderAisleEl(g, items, twoCol) {
    const color = (S.sel.aisleMeta(g.cat) || {}).color || "brand";
    const orig = groups.find(x => x.cat === g.cat) || g;
    let content;
    if (twoCol && g.items.length > 1) {
      // Stable 2-column layout using the CSS grid on .app--mobile .aisle.
      // Items are interleaved [c1[0], c2[0], c1[1], c2[1], ...] so the grid
      // auto-placement cursor advances correctly and both columns fill from the top.
      // explicit gridColumn keeps each item in its assigned column permanently.
      const half = Math.ceil(g.items.length / 2);
      const prepCol = (col, gridCol) => {
        const visible = hideChecked ? col.filter(it => !it.checked) : col;
        return [...visible.filter(it => !it.checked), ...visible.filter(it => it.checked)]
          .map(it => renderGItem(it, gridCol));
      };
      const c1 = prepCol(g.items.slice(0, half), 1);
      const c2 = prepCol(g.items.slice(half), 2);
      content = [];
      for (let i = 0; i < Math.max(c1.length, c2.length); i++) {
        if (i < c1.length) content.push(c1[i]);
        if (i < c2.length) content.push(c2[i]);
      }
    } else {
      content = items.map(it => renderGItem(it));
    }
    return React.createElement("div", { key: g.cat, className: "aisle", "data-c": color },
      React.createElement("div", { className: "aisle__head" },
        React.createElement("span", { className: "aisle__dot" }),
        React.createElement("div", { className: "aisle__name" }, g.name),
        React.createElement("div", { className: "aisle__count" }, orig.items.filter(i => i.checked).length, "/", orig.items.length)),
      content);
  }

  const emptyEl = React.createElement("div", { className: "empty" },
    React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "cart", size: 26 })),
    React.createElement("div", { className: "empty__title" }, "Nog niets voor ", grel),
    React.createElement("div", null, "Er zijn geen maaltijden gepland voor ", S.fmt.fmtDay(gdays[0]), " ", S.fmt.fmtMon(gdays[0]), " – ", S.fmt.fmtDay(gdays[6]), " ", S.fmt.fmtMon(gdays[6]), "."),
    goffset !== 0 && React.createElement("button", { className: "btn btn--soft", style: { marginTop: 16 }, onClick: () => S.actions.gotoCurrentWeek() }, React.createElement(Icon, { name: "today", size: 17 }), "Naar deze week"));

  const allCheckedEl = React.createElement("div", { className: "empty" },
    React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "check", size: 26 })),
    React.createElement("div", { className: "empty__title" }, "Alles afgevinkt!"),
    React.createElement("div", null, "Alle items zijn in het mandje. Toon ze opnieuw via de knop hierboven."));

  let aisles;
  if (groups.length === 0) {
    aisles = React.createElement("div", { className: "aislewrap" }, emptyEl);
  } else if (layout === "desktop") {
    // Desktop: 2 explicit column divs. Within each column, unchecked items stay in
    // their aisle sections; all checked items from that column aggregate at the very bottom.
    const renderCol = (colGroups) => {
      const doneItems = [];
      const aisleEls = colGroups.map(g => {
        const undone = g.items.filter(it => !it.checked);
        if (!hideChecked) g.items.filter(it => it.checked).forEach(it => doneItems.push(it));
        return undone.length > 0 ? renderAisleEl(g, undone) : null;
      }).filter(Boolean);
      return React.createElement("div", { className: "groc__col" },
        aisleEls,
        !hideChecked && doneItems.length > 0 && React.createElement("div", { className: "aisle aisle--done", "data-c": "sage" },
          React.createElement("div", { className: "aisle__head" },
            React.createElement("span", { className: "aisle__dot" }),
            React.createElement("div", { className: "aisle__name" }, "Afgevinkt"),
            React.createElement("div", { className: "aisle__count" }, doneItems.length)),
          doneItems.map(it => renderGItem(it))));
    };
    const visGroups = hideChecked ? groups.filter(g => g.items.some(it => !it.checked)) : groups;
    if (hideChecked && visGroups.length === 0) {
      aisles = React.createElement("div", { className: "aislewrap" }, allCheckedEl);
    } else {
      const col1 = visGroups.filter((_, i) => i % 2 === 0);
      const col2 = visGroups.filter((_, i) => i % 2 === 1);
      aisles = React.createElement("div", { className: "aislewrap aislewrap--cols" }, renderCol(col1), renderCol(col2));
    }
  } else {
    // Mobile: 2 vaste kolommen per categorie — items wisselen nooit van kolom
    const mobileGroups = hideChecked ? groups.filter(g => g.items.some(it => !it.checked)) : groups;
    if (hideChecked && mobileGroups.length === 0) {
      aisles = React.createElement("div", { className: "aislewrap" }, allCheckedEl);
    } else {
      aisles = React.createElement("div", { className: "aislewrap" },
        mobileGroups.map(g => renderAisleEl(g, g.items, true)));
    }
  }

  return React.createElement("div", { className: "wrap screen-anim" },
    React.createElement("div", { className: "shead" },
      React.createElement("div", null,
        React.createElement("h1", { className: "shead__title" }, "Boodschappen"),
        React.createElement("div", { className: "shead__sub" },
          "Samengevoegd uit je weekplanning · gesorteerd op schap",
          hs > 1 && React.createElement("span", { className: "groc-hs-badge" },
            React.createElement(Icon, { name: "user", size: 12 }), ` ${hs} personen`))),
      React.createElement("div", { className: "weeknav" },
        React.createElement("button", { className: "sharetrigger", style: { marginRight: "auto" }, onClick: () => openShare && openShare("groceries"), title: "Boodschappenlijst delen" },
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
