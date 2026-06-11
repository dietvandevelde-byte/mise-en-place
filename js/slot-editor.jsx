/* =========================================================================
   MEAL PLANNER — Recipe picker + Slot editor sheet
   ========================================================================= */

function RecipePicker({ slot, onPick }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [cats, setCats] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const recipes = window.MP.RECIPES;
  const isSnacks = slot === "snacks";
  const slotMeta = isSnacks ? window.MP.SNACK_META : window.MP.SLOTS[slot];
  const allCats = S.sel.allCats();

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return recipes.filter((r) => {
      if (r.fruit) return false;
      if (r.dairy && isSnacks) return false;
      if (!all && isSnacks && !window.MP.isSnackRecipe(r)) return false;
      if (!all && !isSnacks && slot != null && !r.suits.includes(slot)) return false;
      if (ql && !r.title.toLowerCase().includes(ql)) return false;
      if (cats.length && !cats.some(c => S.recipeCategories(r).includes(c))) return false;
      return true;
    });
  }, [q, all, cats, slot, recipes.length]);

  const toggleCat = (key) => setCats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "picker__search" },
      React.createElement(Icon, { name: "search", size: 18 }),
      React.createElement("input", {
        className: "input", placeholder: "Zoek recept…", value: q,
        onChange: (e) => setQ(e.target.value), autoFocus: false,
      })
    ),
    slot != null && React.createElement("div", { style: { display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap", alignItems: "center" } },
      React.createElement("button", { className: "chip", "data-active": all ? 0 : 1, onClick: () => setAll(false) }, "Past bij ", slotMeta.name.toLowerCase()),
      React.createElement("button", { className: "chip", "data-active": all ? 1 : 0, onClick: () => setAll(true) }, "Alle recepten"),
      React.createElement("button", {
        className: "chip",
        "data-active": (showFilters || cats.length) ? 1 : 0,
        style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 },
        onClick: () => setShowFilters(v => !v),
      },
        React.createElement(Icon, { name: "filter", size: 14 }),
        cats.length ? `${cats.length} filter${cats.length > 1 ? "s" : ""}` : "Filter",
        cats.length > 0 && React.createElement("span", {
          style: { marginLeft: 2, cursor: "pointer", opacity: 0.7 },
          onClick: (e) => { e.stopPropagation(); setCats([]); },
        }, "✕")
      )
    ),
    showFilters && React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" } },
      allCats.map((c) => React.createElement("button", {
        key: c.key, className: "chip",
        "data-active": cats.includes(c.key) ? 1 : 0,
        "data-c": c.color || "brand",
        onClick: () => toggleCat(c.key),
        style: { fontSize: 12 },
      }, c.name))
    ),
    React.createElement("div", { className: "picker__list" },
      list.length === 0 && React.createElement("div", { style: { textAlign: "center", color: "var(--ink-3)", padding: "24px 0", fontSize: 14 } }, "Geen recepten gevonden."),
      list.map((r) => {
        const c = window.MP.SLOTS[r.suits[0]] ? window.MP.SLOTS[r.suits[0]].color : "brand";
        return React.createElement("button", { key: r.id, className: "prow", "data-c": c, onClick: () => onPick(r) },
          React.createElement("div", { className: "prow__spine" }),
          React.createElement("div", { className: "prow__body" },
            React.createElement("div", { className: "prow__name" }, r.title, r.imported && React.createElement("span", { className: "imported-flag", style: { marginLeft: 6 } }, "Import")),
            React.createElement("div", { className: "prow__meta" },
              React.createElement("span", null, React.createElement("b", null, r.portions), r.portions > 1 ? " porties" : " portie"),
              React.createElement("span", { className: "dotsep", style: { width: 3, height: 3, borderRadius: 9, background: "var(--ink-4)", display: "inline-block" } }),
              React.createElement("span", null, r.prepTime, " min"),
              r.meatDish && React.createElement("span", { className: "tag", style: { padding: "2px 7px" } }, React.createElement(Icon, { name: "meat", size: 12 }), "Vlees")
            )
          ),
          React.createElement("div", { className: "prow__kcal" },
            React.createElement("b", null, r.kcal),
            React.createElement("span", null, "kcal")
          )
        );
      })
    )
  );
}
window.RecipePicker = RecipePicker;

/* ---- Slot editor sheet ---- */
function SlotSheet({ date, slot, onClose, onSwapStart, toast }) {
  useStore();
  const entry = S.sel.entry(date, slot);
  const slotMeta = window.MP.SLOTS[slot];
  const recipe = entry && entry.recipeId ? S.sel.recipeById(entry.recipeId) : null;
  const status = entry && entry.status ? window.MP.statusByKey(entry.status) : null;
  const filled = !!(entry && (entry.recipeId || entry.manualName || entry.status));
  const [mode, setMode] = useState(filled ? "menu" : "pick");
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const [portions, setPortions] = useState(entry ? entry.portions : 1);
  const [note, setNote] = useState(entry && entry.note ? entry.note : "");
  const [cookDouble, setCookDouble] = useState(entry ? !!entry.cookDouble : false);
  const [importing, setImporting] = useState(false);
  const dowLong = cap(S.fmt.fmtDowLong(date));

  function confirmPick(r) { setPendingRecipe(r); setPortions(slot === 4 ? 2 : 1); setMode("confirm"); }
  function doAssign() {
    S.actions.assign(date, slot, pendingRecipe.id, portions, { cookDouble });
    toast && toast(cookDouble ? `${pendingRecipe.title} ingepland \u00b7 restje als lunch morgen` : `${pendingRecipe.title} ingepland`);
    onClose();
  }

  let body, foot;
  if (mode === "menu") {
    body = React.createElement("div", { className: "actionlist" },
      recipe && React.createElement("button", { className: "actionrow", onClick: () => setMode("view") },
        React.createElement(Icon, { name: "book", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Recept bekijken", React.createElement("small", null, "Ingredi\u00ebnten & bereiding"))),
      React.createElement("button", { className: "actionrow", onClick: () => setMode("pick") },
        React.createElement(Icon, { name: "swap", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, recipe ? "Vervangen" : "Iets anders kiezen", React.createElement("small", null, "Recept of andere optie"))),
      recipe && React.createElement("button", { className: "actionrow", onClick: () => setMode("portions") },
        React.createElement(Icon, { name: "user", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Porties aanpassen", React.createElement("small", null, `Nu ${fmtPortions(entry.portions)}`))),
      recipe && slot === 4 && React.createElement("button", { className: "actionrow", onClick: () => { S.actions.assign(date, slot, entry.recipeId, entry.portions, { cookDouble: !entry.cookDouble }); toast && toast(!entry.cookDouble ? "Kookt dubbel \u00b7 restje morgen" : "Dubbel koken uit"); onClose(); } },
        React.createElement(Icon, { name: "swap", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, entry.cookDouble ? "Dubbel koken uitzetten" : "Kook dubbel", React.createElement("small", null, "Restje als lunch morgen"))),
      React.createElement("button", { className: "actionrow", onClick: () => setMode("note") },
        React.createElement(Icon, { name: "note", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, entry.note ? "Notitie bewerken" : "Notitie toevoegen", entry.note && React.createElement("small", null, entry.note))),
      React.createElement("button", { className: "actionrow", onClick: () => { onSwapStart(date, slot); onClose(); } },
        React.createElement(Icon, { name: "grip", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Wisselen met\u2026", React.createElement("small", null, "Ruil met een ander dagdeel"))),
      React.createElement("button", { className: "actionrow", onClick: () => { S.actions.toggleEaten(date, slot); toast && toast(entry.eaten ? "Teruggezet naar gepland" : "Gemarkeerd als gegeten"); onClose(); } },
        React.createElement(Icon, { name: "check", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, entry.eaten ? "Terug naar gepland" : "Markeer als gegeten")),
      React.createElement("button", { className: "actionrow actionrow--danger", onClick: () => { S.actions.clear(date, slot); toast && toast("Leeggemaakt"); onClose(); } },
        React.createElement(Icon, { name: "trash", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Leegmaken")));
  } else if (mode === "note") {
    body = React.createElement("div", null,
      React.createElement("div", { className: "section-label" }, "Notitie bij dit eetmoment"),
      React.createElement("textarea", { className: "input", rows: 3, placeholder: "bv. eten bij ma", value: note, onChange: (e) => setNote(e.target.value), autoFocus: true }));
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode(filled ? "menu" : "pick") }, "Terug"),
      React.createElement("button", { className: "btn btn--block", onClick: () => { S.actions.setNote(date, slot, note); toast && toast("Notitie opgeslagen"); onClose(); } }, React.createElement(Icon, { name: "check", size: 18 }), "Opslaan"));
  } else if (mode === "pick") {
    body = React.createElement(React.Fragment, null,
      React.createElement(RecipePicker, { slot, onPick: confirmPick }),
      React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 } },
        React.createElement("button", { className: "btn btn--soft btn--block", onClick: () => setMode("create") },
          React.createElement(Icon, { name: "plus", size: 18 }), "Nieuw recept"),
        React.createElement("button", { className: "btn btn--soft btn--block", onClick: () => setImporting(true) },
          React.createElement(Icon, { name: "clipboard", size: 18 }), "Importeer")),
      React.createElement("div", { style: { marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" } },
        React.createElement("div", { className: "section-label" }, "Geen recept? Andere opties"),
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          window.MP.STATUSES.map((s) => React.createElement("button", { key: s.key, className: "optbtn", onClick: () => { S.actions.setStatus(date, slot, s.key, note.trim() || null); toast && toast(`${s.name} ingepland`); onClose(); } },
            React.createElement(Icon, { name: s.icon, size: 17 }), s.name)))));
    foot = filled ? React.createElement("button", { className: "btn btn--ghost btn--block", onClick: () => setMode("menu") }, "Terug") : null;
  } else if (mode === "create") {
    body = React.createElement(window.CreateRecipeForm, {
      slot,
      onCancel: () => setMode(filled ? "menu" : "pick"),
      onSave: (r) => { S.actions.assign(date, slot, r.id, slot === 4 ? 2 : 1); toast && toast(`${r.title} gemaakt & ingepland`); onClose(); },
    });
  } else if (mode === "view") {
    body = React.createElement(window.RecipeView, { recipe, portions: entry.portions });
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode("menu") }, "Terug"),
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode("edit") }, React.createElement(Icon, { name: "edit", size: 17 }), "Bewerken"),
      React.createElement("button", { className: "btn btn--block", onClick: () => { S.actions.toggleEaten(date, slot); toast && toast(entry.eaten ? "Teruggezet" : "Gegeten \u2713"); onClose(); } },
        React.createElement(Icon, { name: "check", size: 18 }), entry.eaten ? "Terug naar gepland" : "Markeer als gegeten"));
  } else if (mode === "edit") {
    body = React.createElement(window.CreateRecipeForm, {
      init: recipe,
      onCancel: () => setMode("view"),
      onSave: () => setMode("view"),
    });
  } else if (mode === "confirm") {
    const c = slotMeta.color;
    const per = { kcal: pendingRecipe.kcal, carbs: pendingRecipe.carbs, protein: pendingRecipe.protein, fat: pendingRecipe.fat };
    body = React.createElement("div", null,
      React.createElement("div", { className: "prow", "data-c": c, style: { cursor: "default", marginBottom: 18 } },
        React.createElement("div", { className: "prow__spine" }),
        React.createElement("div", { className: "prow__body" },
          React.createElement("div", { className: "prow__name" }, pendingRecipe.title),
          React.createElement("div", { className: "prow__meta" }, React.createElement("span", null, pendingRecipe.prepTime, " min"), pendingRecipe.meatDish && React.createElement("span", { className: "tag", style: { padding: "2px 7px" } }, "Vlees"))),
        React.createElement("div", { className: "prow__kcal" }, React.createElement("b", null, Math.round(pendingRecipe.kcal * portions)), React.createElement("span", null, "kcal"))),
      React.createElement("div", { className: "field__row", style: { marginBottom: 4 } },
        React.createElement("div", null,
          React.createElement("div", { className: "field__label" }, "Hoeveel porties?"),
          React.createElement("div", { className: "field__hint" }, "Tot op tienden \u00b7 voeding & hoeveelheden schalen mee")),
        React.createElement(Stepper, { value: portions, onChange: setPortions, step: 0.1, min: 0.1, max: 20, editable: true })),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 16 } },
        [["kcal", Math.round(per.kcal * portions), ""], ["carbs", Math.round(per.carbs * portions), "g kh"], ["prot", Math.round(per.protein * portions), "g eiw"], ["fat", Math.round(per.fat * portions), "g vet"]].map(([k, v, l], i) =>
          React.createElement("div", { key: i, className: "rmacro", "data-k": k === "carbs" ? "carb" : k === "prot" ? "prot" : k === "fat" ? "fat" : "" },
            React.createElement("b", null, v), React.createElement("span", null, l || "kcal")))),
      slot === 4 && React.createElement("button", { type: "button", className: "cookdbl" + (cookDouble ? " cookdbl--on" : ""), onClick: () => setCookDouble((v) => !v) },
        React.createElement("span", { className: "cookdbl__check" }, cookDouble && React.createElement(Icon, { name: "check", size: 14 })),
        React.createElement("span", { className: "cookdbl__txt" },
          React.createElement("b", null, "Kook dubbel"),
          React.createElement("small", null, "Restje wordt automatisch ingepland als lunch morgen \u2014 zonder extra boodschappen.")),
        React.createElement(Icon, { name: "swap", size: 17 })));
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode(filled ? "menu" : "pick") }, "Terug"),
      React.createElement("button", { className: "btn btn--block", onClick: doAssign }, React.createElement(Icon, { name: "check", size: 18 }), "Inplannen"));
  } else if (mode === "portions") {
    body = React.createElement("div", { style: { textAlign: "center", padding: "10px 0" } },
      React.createElement("div", { className: "bigreadout", style: { marginBottom: 18 } }, nlNum(portions), React.createElement("span", null, portions === 1 ? " portie" : " porties")),
      React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, React.createElement(Stepper, { value: portions, onChange: setPortions, step: 0.1, min: 0.1, max: 20, editable: true })),
      React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--ink-3)" } }, "Stap van 0,1 \u2014 of typ rechtstreeks, bv. 1,7"),
      recipe && React.createElement("div", { style: { marginTop: 14, color: "var(--ink-2)", fontWeight: 600 } }, `${Math.round(recipe.kcal * portions)} kcal totaal`));
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode("menu") }, "Terug"),
      React.createElement("button", { className: "btn btn--block", onClick: () => { S.actions.setPortions(date, slot, portions); toast && toast("Porties aangepast"); onClose(); } }, "Opslaan"));
  }

  const baseTitle = recipe ? recipe.title : status ? status.name : (entry && entry.manualName) ? entry.manualName : slotMeta.name;
  const titleTxt = mode === "pick" ? `${slotMeta.name} inplannen` : mode === "create" ? "Nieuw recept" : mode === "edit" ? "Recept bewerken" : mode === "note" ? "Notitie" : mode === "view" ? (recipe ? recipe.title : slotMeta.name) : mode === "confirm" ? "Inplannen" : mode === "portions" ? "Porties" : baseTitle;
  return React.createElement(React.Fragment, null,
    React.createElement(Sheet, {
      eyebrow: `${dowLong} \u00b7 ${slotMeta.name}`, eyebrowColor: slotMeta.color,
      title: titleTxt, onClose, foot,
    }, body),
    importing && React.createElement(window.ImportSheet, { onClose: () => setImporting(false), toast }));
}
window.SlotSheet = SlotSheet;

/* ---- Snacks editor for one day — a FLEXIBLE list (add any number) ---- */
const SNACK_COLORS = ["sage", "teal", "indigo", "honey", "berry"];
function SnacksDaySheet({ date, onClose, toast }) {
  const state = useStore();
  const dowLong = cap(S.fmt.fmtDowLong(date));

  // Bereken de snacklijst vóór useState zodat we de beginmode kunnen bepalen
  const list = S.sel.snacksFor(date);
  // Als er nog geen snacks zijn: ga direct naar de keuzelijst (sla de lege overzichtskaart over)
  const [mode, setMode] = useState(() => list.length === 0 ? "pick" : "list");
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const [portions, setPortions] = useState(1);
  const [importing, setImporting] = useState(false);
  const [editId, setEditId] = useState(null);      // snack being edited
  const [replaceId, setReplaceId] = useState(null);// snack being replaced via picker
  const totalKcal = list.reduce((a, e) => a + (e.recipeId ? S.entryNutrition(e).kcal : 0), 0);
  const editEntry = editId ? list.find((e) => e.id === editId) : null;
  const editRecipe = editEntry && editEntry.recipeId ? S.sel.recipeById(editEntry.recipeId) : null;

  const replacingFruit = replaceId ? S.recipeFoods(S.sel.recipeById((list.find((x) => x.id === replaceId) || {}).recipeId) || {}).includes("fruit") : false;
  function startReplace(id) { setReplaceId(id); setMode("pick"); }
  function confirmPick(r) { setPendingRecipe(r); setPortions(1); setMode("confirm"); }
  function commitRecipe() {
    const isFruit = S.recipeFoods(pendingRecipe).includes("fruit");
    if (isFruit && !replacingFruit) {
      const chk = S.sel.canAddFruitSnack(date);
      if (!chk.ok) { toast && toast(chk.reason); return; }
    }
    if (replaceId) { S.actions.updateSnack(date, replaceId, { recipeId: pendingRecipe.id, portions, status: null, manualName: null }); toast && toast(`${pendingRecipe.title} ingesteld`); }
    else { S.actions.addSnack(date, { recipeId: pendingRecipe.id, portions }); toast && toast(`${pendingRecipe.title} toegevoegd`); }
    setReplaceId(null); setPendingRecipe(null); setMode("list");
  }
  function addFruit(r) {
    if (!replacingFruit) {
      const chk = S.sel.canAddFruitSnack(date);
      if (!chk.ok) { toast && toast(chk.reason); return; }
    }
    if (replaceId) S.actions.updateSnack(date, replaceId, { recipeId: r.id, portions: 1, status: null, manualName: null });
    else S.actions.addSnack(date, { recipeId: r.id, portions: 1 });
    toast && toast(`${r.title} toegevoegd`); setReplaceId(null); setMode("list");
  }
  function addQuick(r) {
    if (replaceId) S.actions.updateSnack(date, replaceId, { recipeId: r.id, portions: 1, status: null, manualName: null });
    else S.actions.addSnack(date, { recipeId: r.id, portions: 1 });
    toast && toast(`${r.title} toegevoegd`); setReplaceId(null); setMode("list");
  }
  function commitStatus(s) {
    if (replaceId) S.actions.updateSnack(date, replaceId, { status: s.key, recipeId: null, manualName: null, portions: 1 });
    else S.actions.addSnack(date, { status: s.key });
    toast && toast(`${s.name} toegevoegd`); setReplaceId(null); setMode("list");
  }

  let body, foot, titleTxt = "Snacks";

  if (mode === "list") {
    const cards = list.map((e, idx) => {
      const recipe = e.recipeId ? S.sel.recipeById(e.recipeId) : null;
      const status = e.status ? window.MP.statusByKey(e.status) : null;
      const n = recipe ? S.entryNutrition(e) : null;
      const color = SNACK_COLORS[idx % SNACK_COLORS.length];
      const nm = recipe ? recipe.title : status ? status.name : e.manualName;
      return React.createElement("div",
        { key: e.id, className: "snackrow", "data-c": color, "data-filled": 1, "data-eaten": e.eaten ? 1 : 0 },
        React.createElement("div", { className: "snackrow__spine" }),
        React.createElement("button", {
          className: "snackrow__check", title: e.eaten ? "Teruggezet naar gepland" : "Markeer als gegeten",
          "aria-pressed": e.eaten ? "true" : "false",
          onClick: () => { S.actions.toggleSnackEaten(date, e.id); toast && toast(e.eaten ? "Teruggezet" : `${nm} gegeten ✓`); },
        }, e.eaten && React.createElement(Icon, { name: "check", size: 15 })),
        React.createElement("button", { className: "snackrow__main", onClick: () => { setEditId(e.id); setMode("entry"); } },
          React.createElement("div", { className: "snackrow__name" }, nm),
          React.createElement("div", { className: "snackrow__meta" },
            React.createElement("span", null, recipe ? fmtPortions(e.portions) : (status ? "andere optie" : "los item")),
            e.eaten && React.createElement("span", { className: "snackrow__eaten" }, "Gegeten"))),
        React.createElement("div", { className: "snackrow__right" },
          recipe && React.createElement("div", { className: "snackrow__kcal" },
            React.createElement("b", null, n.kcal), React.createElement("span", null, "kcal")),
          React.createElement("button", { className: "snackrow__icon", title: "Wijzigen", onClick: () => { setEditId(e.id); setMode("entry"); } },
            React.createElement(Icon, { name: "edit", size: 16 })),
          React.createElement("button", { className: "snackrow__icon snackrow__icon--danger", title: "Verwijderen", onClick: () => { S.actions.removeSnack(date, e.id); toast && toast("Snack verwijderd"); } },
            React.createElement(Icon, { name: "trash", size: 16 }))));
    });
    body = React.createElement("div", null,
      list.length > 0 && React.createElement("div", { className: "snacksum" },
        React.createElement("div", { className: "snacksum__l" },
          React.createElement("span", { className: "snacksum__count" }, list.length),
          React.createElement("span", { className: "snacksum__lbl" }, list.length === 1 ? "snack gepland" : "snacks gepland")),
        totalKcal > 0 && React.createElement("div", { className: "snacksum__kcal" },
          React.createElement("b", null, totalKcal), React.createElement("span", null, "kcal"))),
      list.length > 0
        ? React.createElement("div", { className: "snacklist" }, cards)
        : React.createElement("div", { className: "snackempty" },
            React.createElement("div", { className: "snackempty__icon" }, React.createElement(Icon, { name: "leaf", size: 26 })),
            React.createElement("div", { className: "snackempty__t" }, "Nog geen snacks"),
            React.createElement("div", { className: "snackempty__s" }, "Voeg er zo veel toe als je wilt \u2014 een appel, een eiwitreep, een potje yoghurt \u2026")),
      React.createElement("div", { className: "snackhint" }, "Voeg zo veel snacks toe als je wilt. Tik een snack aan om te bewerken."));
    foot = React.createElement("button", { className: "btn btn--block", onClick: () => { setReplaceId(null); setMode("pick"); } },
      React.createElement(Icon, { name: "plus", size: 18 }), "Snack toevoegen");
  } else if (mode === "pick") {
    titleTxt = replaceId ? "Snack vervangen" : "Snack toevoegen";
    body = React.createElement(React.Fragment, null,
      React.createElement(RecipePicker, { slot: "snacks", onPick: confirmPick }),
      React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 } },
        React.createElement("button", { className: "btn btn--soft btn--block", onClick: () => setMode("create") },
          React.createElement(Icon, { name: "plus", size: 18 }), "Nieuw recept"),
        React.createElement("button", { className: "btn btn--soft btn--block", onClick: () => setImporting(true) },
          React.createElement(Icon, { name: "clipboard", size: 18 }), "Importeer")),
      React.createElement("div", { style: { marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" } },
        React.createElement("div", { className: "section-label" }, "Geen recept? Andere opties"),
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          window.MP.STATUSES.map((s) => React.createElement("button", { key: s.key, className: "optbtn", onClick: () => commitStatus(s) },
            React.createElement(Icon, { name: s.icon, size: 17 }), s.name)))),
      React.createElement("div", { className: "fruitpick" },
        React.createElement("div", { className: "section-label" }, "Fruit als snack"),
        React.createElement("div", { className: "fruitpick__note" },
          React.createElement(Icon, { name: "leaf", size: 15 }),
          React.createElement("span", null,
            "Max. ", (state.targets.maxFruitPerDay || 2), " stuks fruit per dag.",
            S.sel.breakfastHasFruit(date) ? " Het ontbijt bevat al fruit — dus nog max. 1 fruitsnack vandaag." : "")),
        (function () {
          const cap = state.targets.maxFruitPerDay || 2;
          const full = !replacingFruit && !S.sel.canAddFruitSnack(date).ok;
          return React.createElement("div", { className: "fruitcount", "data-full": full ? 1 : 0 },
            React.createElement("span", null, full ? "Limiet bereikt voor vandaag" : "Fruit vandaag"),
            React.createElement("span", { className: "fruitcount__c" }, S.sel.fruitPiecesDay(date), " / ", cap));
        })(),
        React.createElement("div", { className: "fruitpick__grid" },
          window.MP.fruitSnacks().map((r) => {
            const disabled = !replacingFruit && !S.sel.canAddFruitSnack(date).ok;
            return React.createElement("button", { key: r.id, className: "fruitchip", disabled, onClick: () => addFruit(r) },
              React.createElement("span", { className: "fruitchip__dot" }, React.createElement(Icon, { name: "leaf", size: 13 })),
              React.createElement("span", { className: "fruitchip__t" },
                React.createElement("div", { className: "fruitchip__name" }, r.title),
                React.createElement("div", { className: "fruitchip__amt" }, r.serving, " · ", r.kcal, " kcal")));
          }))),
      React.createElement("div", { className: "fruitpick" },
        React.createElement("div", { className: "section-label" }, "Zuivel & alternatieven"),
        React.createElement("div", { className: "fruitpick__note" },
          React.createElement(Icon, { name: "leaf", size: 15 }),
          React.createElement("span", null, "Ook geschikt als ontbijt. Hoeveelheid per portie staat erbij — kaas max. 1× per dag.")),
        React.createElement("div", { className: "fruitpick__grid" },
          window.MP.dairySnacks().map((r) => React.createElement("button", { key: r.id, className: "fruitchip", "data-alt": r.dairyAlt ? 1 : 0, onClick: () => addQuick(r) },
            React.createElement("span", { className: "fruitchip__dot" }, React.createElement(Icon, { name: "milk", size: 13 })),
            React.createElement("span", { className: "fruitchip__t" },
              React.createElement("div", { className: "fruitchip__name" }, r.title),
              React.createElement("div", { className: "fruitchip__amt" }, r.serving, " · ", r.kcal, " kcal")))))
    ));
    foot = React.createElement("button", { className: "btn btn--ghost btn--block", onClick: () => setMode(replaceId ? "entry" : "list") }, "Terug");
  } else if (mode === "confirm") {
    titleTxt = replaceId ? "Vervangen" : "Toevoegen";
    const c = window.MP.SLOTS[pendingRecipe.suits[0]] ? window.MP.SLOTS[pendingRecipe.suits[0]].color : "sage";
    body = React.createElement("div", null,
      React.createElement("div", { className: "prow", "data-c": c, style: { cursor: "default", marginBottom: 18 } },
        React.createElement("div", { className: "prow__spine" }),
        React.createElement("div", { className: "prow__body" },
          React.createElement("div", { className: "prow__name" }, pendingRecipe.title),
          React.createElement("div", { className: "prow__meta" }, React.createElement("span", null, pendingRecipe.prepTime, " min"))),
        React.createElement("div", { className: "prow__kcal" }, React.createElement("b", null, Math.round(pendingRecipe.kcal * portions)), React.createElement("span", null, "kcal"))),
      React.createElement("div", { className: "field__row", style: { marginBottom: 4 } },
        React.createElement("div", null,
          React.createElement("div", { className: "field__label" }, "Hoeveel porties?"),
          React.createElement("div", { className: "field__hint" }, "Voeding schaalt mee")),
        React.createElement(Stepper, { value: portions, onChange: setPortions, step: 0.1, min: 0.1, max: 20, editable: true })));
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode("pick") }, "Terug"),
      React.createElement("button", { className: "btn btn--block", onClick: commitRecipe }, React.createElement(Icon, { name: "check", size: 18 }), replaceId ? "Vervangen" : "Toevoegen"));
  } else if (mode === "create") {
    titleTxt = "Nieuw recept";
    body = React.createElement(window.CreateRecipeForm, {
      slot: 1,
      onCancel: () => setMode("pick"),
      onSave: (r) => {
        if (replaceId) { S.actions.updateSnack(date, replaceId, { recipeId: r.id, portions: 1, status: null, manualName: null }); }
        else { S.actions.addSnack(date, { recipeId: r.id, portions: 1 }); }
        toast && toast(`${r.title} gemaakt & toegevoegd`); setReplaceId(null); setMode("list");
      },
    });
  } else if (mode === "entry" && editEntry) {
    titleTxt = editRecipe ? editRecipe.title : (editEntry.status ? window.MP.statusByKey(editEntry.status).name : editEntry.manualName) || "Snack";
    body = React.createElement("div", { className: "actionlist" },
      React.createElement("button", { className: "actionrow", onClick: () => startReplace(editEntry.id) },
        React.createElement(Icon, { name: "swap", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Vervangen", React.createElement("small", null, "Kies een ander recept of optie"))),
      editRecipe && React.createElement("button", { className: "actionrow", onClick: () => { setPortions(editEntry.portions); setMode("portions"); } },
        React.createElement(Icon, { name: "user", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Porties aanpassen", React.createElement("small", null, `Nu ${fmtPortions(editEntry.portions)}`))),
      React.createElement("button", { className: "actionrow", onClick: () => { S.actions.toggleSnackEaten(date, editEntry.id); toast && toast(editEntry.eaten ? "Teruggezet" : "Gegeten ✓"); setMode("list"); } },
        React.createElement(Icon, { name: "check", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, editEntry.eaten ? "Terug naar gepland" : "Markeer als gegeten")),
      React.createElement("button", { className: "actionrow actionrow--danger", onClick: () => { S.actions.removeSnack(date, editEntry.id); toast && toast("Snack verwijderd"); setMode("list"); } },
        React.createElement(Icon, { name: "trash", size: 20 }),
        React.createElement("div", { className: "actionrow__txt" }, "Verwijderen")));
    foot = React.createElement("button", { className: "btn btn--ghost btn--block", onClick: () => setMode("list") }, "Terug naar snacks");
  } else if (mode === "portions" && editEntry) {
    titleTxt = "Porties";
    body = React.createElement("div", { style: { textAlign: "center", padding: "10px 0" } },
      React.createElement("div", { className: "bigreadout", style: { marginBottom: 18 } }, nlNum(portions), React.createElement("span", null, portions === 1 ? " portie" : " porties")),
      React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, React.createElement(Stepper, { value: portions, onChange: setPortions, step: 0.1, min: 0.1, max: 20, editable: true })),
      editRecipe && React.createElement("div", { style: { marginTop: 14, color: "var(--ink-2)", fontWeight: 600 } }, `${Math.round(editRecipe.kcal * portions)} kcal totaal`));
    foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => setMode("entry") }, "Terug"),
      React.createElement("button", { className: "btn btn--block", onClick: () => { S.actions.updateSnack(date, editEntry.id, { portions: Math.max(0.1, Math.round(portions * 10) / 10) }); toast && toast("Porties aangepast"); setMode("list"); } }, "Opslaan"));
  } else {
    // fallback (e.g. edited entry vanished) → list
    body = React.createElement("div", { className: "snackhint" }, "Even niets te tonen.");
    foot = React.createElement("button", { className: "btn btn--block", onClick: () => setMode("list") }, "Terug naar snacks");
  }

  return React.createElement(React.Fragment, null,
    React.createElement(Sheet, { eyebrow: `${dowLong} · snacks`, eyebrowColor: "sage", title: titleTxt, onClose, foot }, body),
    importing && React.createElement(window.ImportSheet, { onClose: () => setImporting(false), toast }));
}
window.SnacksDaySheet = SnacksDaySheet;
