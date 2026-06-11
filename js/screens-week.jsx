/* =========================================================================
   MEAL PLANNER — Week planner screen
   ========================================================================= */
function WeekScreen({ layout, openSlot, openSnacks, toast, swap, openShare }) {
  const state = useStore();
  const days = S.sel.days();
  const offset = state.weekOffset || 0;
  const relLabel = offset === 0 ? "Deze week" : offset === 1 ? "Volgende week" : offset === -1 ? "Vorige week"
    : offset > 1 ? `Over ${offset} weken` : `${-offset} weken geleden`;
  const max = state.targets.maxKcal;
  const SLOTS = window.MP.SLOTS;
  const showSnacks = state.showSnacks !== false;
  const mealMetas = [SLOTS[0], SLOTS[2], SLOTS[4]];   // ontbijt, lunch, diner
  const [drag, setDrag] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("mp_onboarded"));

  function dismissOnboarding() { localStorage.setItem("mp_onboarded", "1"); setShowOnboarding(false); }
  useEffect(() => { if (filled > 0) dismissOnboarding(); }, [filled]);

  const swapping = !!swap.source;

  function cellClick(date, slot) {
    if (swapping) { swap.pick(date, slot); return; }
    openSlot(date, slot);
  }

  // ---- week summary ----
  const totalKcal = days.reduce((a, d) => a + S.sel.dayTotals(d, true).planned.kcal, 0);
  const avgKcal = Math.round(totalKcal / 7);
  const meat = S.sel.weekMeat();
  let filled = 0;
  days.forEach((d) => { [0, 2, 4].forEach((s) => { const e = S.sel.entry(d, s); if (e && (e.recipeId || e.manualName)) filled++; }); });

  const summary = React.createElement("div", { className: "weeksum" },
    React.createElement("div", { className: "sumcard" },
      React.createElement("div", { className: "sumcard__lbl" }, "Gem. per dag"),
      React.createElement("div", { className: "sumcard__val", "data-over": avgKcal > max ? 1 : 0 }, avgKcal.toLocaleString("nl-NL"), React.createElement("small", null, "kcal")),
      React.createElement("div", { className: "sumcard__bar" }, React.createElement("div", { className: "sumcard__bar-fill", "data-over": avgKcal > max ? 1 : 0, style: { width: Math.min(100, avgKcal / max * 100) + "%" } }))),
    React.createElement("div", { className: "sumcard" },
      React.createElement("div", { className: "sumcard__lbl" }, "Vleesgerechten"),
      React.createElement("div", { className: "sumcard__val", "data-over": meat > state.targets.maxMeatPerWeek ? 1 : 0 }, meat, React.createElement("small", null, "/ ", state.targets.maxMeatPerWeek, " max")),
      React.createElement("div", { className: "sumcard__bar" }, React.createElement("div", { className: "sumcard__bar-fill", "data-over": meat > state.targets.maxMeatPerWeek ? 1 : 0, style: { width: Math.min(100, meat / state.targets.maxMeatPerWeek * 100) + "%" } }))),
    React.createElement("div", { className: "sumcard" },
      React.createElement("div", { className: "sumcard__lbl" }, "Ingepland"),
      React.createElement("div", { className: "sumcard__val" }, filled, React.createElement("small", null, "/ 21 maaltijden")),
      React.createElement("div", { className: "sumcard__bar" }, React.createElement("div", { className: "sumcard__bar-fill", style: { width: (filled / 21 * 100) + "%" } })))
  );

  const hasSug = S.actions.hasSuggested();
  const aibar = React.createElement("div", { className: "aibar" },
    React.createElement("div", { className: "aibar__icon" }, React.createElement(Icon, { name: "spark", size: 22 })),
    React.createElement("div", { className: "aibar__txt" },
      React.createElement("div", { className: "aibar__title" }, layout === "mobile" ? "Weekvoorstel" : "Stel mijn week voor"),
      React.createElement("div", { className: "aibar__sub" }, "Vul lege slots automatisch — afgestemd op je kcal-doel, vleeslimiet en het seizoen.")),
    React.createElement("button", { className: "btn", onClick: () => { S.actions.suggestWeek(); toast("Week voorgesteld ✓"); } },
      React.createElement(Icon, { name: "spark", size: 18 }), React.createElement("span", { className: "aibar__btnlbl" }, "Voorstellen")),
    hasSug && React.createElement("button", { className: "btn btn--ghost", title: "Nieuw voorstel — vervang de automatische keuzes door verse, jouw eigen keuzes blijven", onClick: () => { S.actions.newSuggestion(); toast("Nieuw voorstel ✓"); } },
      React.createElement(Icon, { name: "refresh", size: 17 }), React.createElement("span", { className: "aibar__btnlbl" }, "Nieuw voorstel")),
    hasSug && React.createElement("button", { className: "btn btn--ghost", title: "Voorstel wissen — verwijder alleen de automatisch ingevulde gaten, jouw eigen keuzes blijven staan", onClick: () => { S.actions.clearSuggested(); toast("Voorstel gewist — eigen keuzes behouden"); } },
      React.createElement(Icon, { name: "x", size: 17 }), React.createElement("span", { className: "aibar__btnlbl" }, "Voorstel wissen")),
    React.createElement("button", { className: "btn btn--ghost aibar__clear", title: "Alles leegmaken — verwijder ook je eigen keuzes", onClick: () => { S.actions.clearWeek(); toast("Week leeggemaakt"); } },
      React.createElement(Icon, { name: "trash", size: 17 }), React.createElement("span", { className: "aibar__btnlbl" }, "Leeg"))
  );

  const swapBanner = swapping && React.createElement("div", { className: "swapbar" },
    React.createElement(Icon, { name: "swap", size: 18 }),
    React.createElement("span", { style: { flex: 1 } }, "Kies het dagdeel om mee te ", React.createElement("b", null, "wisselen"), " — ", cap(S.fmt.fmtDow(swap.source.date)), " ", SLOTS[swap.source.slot].name.toLowerCase()),
    React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: swap.cancel }, "Annuleren"));

  // ---- DESKTOP matrix ----
  function MatrixCell(date, slot) {
    const dishes = S.sel.mealRows(date, slot).map((x) => x.e);
    const e = dishes[0] || null;
    const meta = SLOTS[slot];
    const recipe = e && e.recipeId ? S.sel.recipeById(e.recipeId) : null;
    const cstatus = e && e.status ? window.MP.statusByKey(e.status) : null;
    const filledCell = dishes.length > 0;
    const key = date + "|" + slot;
    const isSwapSel = swapping && swap.source.date === date && swap.source.slot === slot;
    const cellProps = {
      className: "mcell" + (dragOver === key ? " dragover" : ""), "data-c": meta.color,
      onDragOver: (ev) => { if (drag) { ev.preventDefault(); setDragOver(key); } },
      onDragLeave: () => setDragOver((k) => k === key ? null : k),
      onDrop: (ev) => { ev.preventDefault(); if (drag && !(drag.date === date && drag.slot === slot)) { S.actions.swap(drag.date, drag.slot, date, slot); toast("Gewisseld"); } setDrag(null); setDragOver(null); },
    };
    if (!filledCell) {
      return React.createElement("div", { key, ...cellProps },
        React.createElement("div", { className: "mcell__empty", onClick: () => cellClick(date, slot) }, React.createElement(Icon, { name: "plus", size: 16 })));
    }
    const allEaten = dishes.every((d) => d.eaten);
    const multi = dishes.length > 1;
    const totalKcal = dishes.reduce((a, d) => a + (d.recipeId ? S.entryNutrition(d).kcal : 0), 0);
    return React.createElement("div", { key, ...cellProps },
      React.createElement("div", {
        className: "mcell__card" + (isSwapSel ? " swapsel" : "") + (drag && drag.date === date && drag.slot === slot ? " dragging" : ""),
        "data-eaten": allEaten ? 1 : 0, onClick: () => cellClick(date, slot),
        draggable: !swapping, onDragStart: () => setDrag({ date, slot }), onDragEnd: () => { setDrag(null); setDragOver(null); },
      },
        multi
          ? React.createElement(React.Fragment, null,
              React.createElement("div", { className: "mcell__snacks" }, dishes.map((d, i) => {
                const r = d.recipeId ? S.sel.recipeById(d.recipeId) : null;
                const st = d.status ? window.MP.statusByKey(d.status) : null;
                return React.createElement("div", { key: i, className: "mcell__snackitem" }, d.leftoverOf && "\u21a9 ", r ? r.title : st ? st.name : d.manualName);
              })),
              React.createElement("div", { className: "mcell__sub" }, totalKcal, " kcal", dishes.some((d) => d.note) && React.createElement(Icon, { name: "note", size: 10, style: { marginLeft: 4, color: "var(--ink-4)" } })))
          : React.createElement(React.Fragment, null,
              React.createElement("div", { className: "mcell__name" }, recipe ? recipe.title : cstatus ? cstatus.name : e.manualName),
              React.createElement("div", { className: "mcell__sub" },
                e.leftoverOf ? React.createElement("span", { className: "leftover-badge" }, React.createElement(Icon, { name: "swap", size: 9 }), "Restje")
                  : recipe ? React.createElement(React.Fragment, null, S.entryNutrition(e).kcal, " kcal", recipe.meatDish && React.createElement(Icon, { name: "meat", size: 11 }), e.cookDouble && React.createElement(Icon, { name: "swap", size: 11, style: { marginLeft: 2 }, title: "Kook dubbel" }))
                  : cstatus ? React.createElement(Icon, { name: cstatus.icon, size: 11 })
                  : null),
              e.note && React.createElement("div", { className: "mcell__note" }, e.note)))
    );
  }

  function SnacksMatrixCell(date) {
    const sum = S.sel.snackSummary(date);
    const key = date + "|snacks";
    if (sum.count === 0) {
      return React.createElement("div", { key, className: "mcell", "data-c": "sage" },
        React.createElement("div", { className: "mcell__empty", onClick: () => openSnacks(date) }, React.createElement(Icon, { name: "plus", size: 16 })));
    }
    return React.createElement("div", { key, className: "mcell", "data-c": "sage" },
      React.createElement("div", { className: "mcell__card mcell__card--snacks", "data-eaten": sum.eaten ? 1 : 0, onClick: () => openSnacks(date) },
        React.createElement("div", { className: "mcell__snacks" }, sum.names.map((nm, i) => React.createElement("div", { key: i, className: "mcell__snackitem" }, nm))),
        React.createElement("div", { className: "mcell__sub" }, sum.kcal, " kcal")));
  }

  const matrix = React.createElement("div", { className: "matrix" },
    React.createElement("div", { className: "matrix__row matrix__row--head" },
      React.createElement("div", { className: "matrix__corner" }, React.createElement("span", null, "Week")),
      days.map((d) => {
        const t = S.sel.dayTotals(d, true);
        return React.createElement("div", { key: d, className: "matrix__dayhead", "data-today": d === state.today ? 1 : 0 },
          React.createElement("div", { className: "matrix__dayhead-dow" }, S.fmt.fmtDow(d)),
          React.createElement("div", { className: "matrix__dayhead-day" }, S.fmt.fmtDay(d)),
          React.createElement("div", { className: "matrix__dayhead-kcal", "data-over": t.planned.kcal > max ? 1 : 0 }, t.planned.kcal.toLocaleString("nl-NL")));
      })
    ),
    mealMetas.map((meta) => React.createElement("div", { key: meta.i, className: "matrix__row" },
      React.createElement("div", { className: "matrix__mealhead", "data-c": meta.color },
        React.createElement("div", { className: "dot" }),
        React.createElement("div", { className: "matrix__mealhead-name" }, meta.name)),
      days.map((d) => MatrixCell(d, meta.i))
    )),
    showSnacks && React.createElement("div", { key: "snacks", className: "matrix__row" },
      React.createElement("div", { className: "matrix__mealhead", "data-c": "sage" },
        React.createElement("div", { className: "dot" }),
        React.createElement("div", { className: "matrix__mealhead-name" }, "Snacks")),
      days.map((d) => SnacksMatrixCell(d)))
  );

  // ---- MOBILE day cards ----
  function MobileDay(date) {
    const t = S.sel.dayTotals(date, true);
    const over = t.planned.kcal > max;
    return React.createElement("div", { key: date, className: "wday" },
      React.createElement("div", { className: "wday__head", "data-today": date === state.today ? 1 : 0 },
        React.createElement("div", { className: "wday__date" }, S.fmt.fmtDay(date)),
        React.createElement("div", null,
          React.createElement("div", { className: "wday__dow" }, cap(S.fmt.fmtDowLong(date))),
          React.createElement("div", { style: { fontSize: 11, color: "var(--ink-3)", fontWeight: 600 } }, S.fmt.fmtDay(date), " ", S.fmt.fmtMon(date))),
        React.createElement("div", { className: "wday__kcal" },
          React.createElement("b", { "data-over": over ? 1 : 0 }, t.planned.kcal.toLocaleString("nl-NL")),
          React.createElement("span", null, "van ", max))),
      React.createElement("div", { className: "wday__bar" }, React.createElement("div", { className: "wday__bar-fill", "data-over": over ? 1 : 0, style: { width: Math.min(100, t.planned.kcal / max * 100) + "%" } })),
      React.createElement("div", { className: "wday__slots" },
        mealMetas.map((meta) => {
          const dishes = S.sel.mealRows(date, meta.i).map((x) => x.e);
          const e = dishes[0] || null;
          const recipe = e && e.recipeId ? S.sel.recipeById(e.recipeId) : null;
          const cstatus = e && e.status ? window.MP.statusByKey(e.status) : null;
          const filledCell = dishes.length > 0;
          const allEaten = filledCell && dishes.every((d) => d.eaten);
          const totalKcal = dishes.reduce((a, d) => a + (d.recipeId ? S.entryNutrition(d).kcal : 0), 0);
          const names = dishes.map((d) => { const r = d.recipeId ? S.sel.recipeById(d.recipeId) : null; const st = d.status ? window.MP.statusByKey(d.status) : null; return r ? r.title : st ? st.name : d.manualName; });
          const isSwapSel = swapping && swap.source.date === date && swap.source.slot === meta.i;
          return React.createElement("div", { key: meta.i, className: "wslot" + (isSwapSel ? " swapsel" : ""), "data-c": meta.color, "data-empty": filledCell ? 0 : 1, onClick: () => cellClick(date, meta.i), style: { opacity: allEaten ? 0.6 : 1 } },
            React.createElement("div", { className: "wslot__spine" }),
            React.createElement("div", { className: "wslot__meal" }, meta.short),
            filledCell
              ? React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "wslot__name" }, names.join(", ")),
                  e && e.note && React.createElement("div", { className: "wslot__note" }, e.note))
              : React.createElement("div", { className: "wslot__name empty" }, "—"),
            totalKcal > 0
              ? React.createElement("div", { className: "wslot__kcal" }, totalKcal)
              : filledCell
                ? React.createElement("div", { className: "wslot__kcal" }, React.createElement(Icon, { name: cstatus ? cstatus.icon : "note", size: 14, style: { color: "var(--ink-4)" } }))
                : React.createElement("div", { className: "wslot__kcal" }, React.createElement(Icon, { name: "plus", size: 15, style: { color: "var(--ink-4)" } })));
        }),
        showSnacks && (function () {
          const sum = S.sel.snackSummary(date);
          const has = sum.count > 0;
          return React.createElement("div", { key: "snacks", className: "wslot", "data-c": "sage", onClick: () => openSnacks(date), style: { opacity: has && sum.eaten ? 0.6 : 1 } },
            React.createElement("div", { className: "wslot__spine" }),
            React.createElement("div", { className: "wslot__meal" }, "Snacks"),
            has
              ? React.createElement("div", { className: "wslot__name" }, sum.names.join(", "))
              : React.createElement("div", { className: "wslot__name empty" }, "—"),
            has
              ? React.createElement("div", { className: "wslot__kcal" }, sum.kcal)
              : React.createElement("div", { className: "wslot__kcal" }, React.createElement(Icon, { name: "plus", size: 15, style: { color: "var(--ink-4)" } })));
        })()
      )
    );
  }

  // weekly intake vs limits — subtle bar under the schedule
  const FL = window.MP.FOOD_LIMITS;
  const anyLimit = FL.some((f) => f.key !== "zuivel" && (state.targets[f.week] || 0) > 0);
  const weeklimits = React.createElement("div", { className: "weeklimits" },
    React.createElement("div", { className: "weeklimits__lbl" }, React.createElement(Icon, { name: "meat", size: 14 }), "Deze week"),
    React.createElement("div", { className: "weeklimits__row" },
      FL.filter((f) => f.key !== "zuivel").map((f) => {
        const lim = state.targets[f.week] || 0;
        const n = S.sel.foodCountWeek(f.key);
        const over = lim > 0 && n > lim;
        const near = lim > 0 && !over && n >= lim;
        return React.createElement("div", { key: f.key, className: "wlimit", "data-over": over ? 1 : 0, "data-near": near ? 1 : 0, title: lim > 0 ? `${f.name}: ${n} van max. ${lim} deze week` : `${f.name}: ${n} gepland` },
          React.createElement("span", { className: "wlimit__dot", style: { background: `var(--${f.color})` } }),
          React.createElement("span", { className: "wlimit__name" }, f.name),
          React.createElement("span", { className: "wlimit__val" }, n, "\u00d7", lim > 0 ? React.createElement("span", { className: "wlimit__max" }, " / ", lim, "\u00d7") : null));
      })),
    anyLimit && React.createElement("div", { className: "weeklimits__note" }, "Limieten pas je aan in Profiel \u2192 Voedingslimieten."));

  return React.createElement("div", { className: "wrap screen-anim" },
    React.createElement("div", { className: "shead" },
      React.createElement("div", { className: "shead__lead" },
        React.createElement("div", null,
          React.createElement("h1", { className: "shead__title" }, "Weekplanner"),
          React.createElement("div", { className: "shead__sub" },
            cap(S.fmt.fmtDowLong(days[0])), " ", S.fmt.fmtDay(days[0]), " ", S.fmt.fmtMon(days[0]),
            " — ", S.fmt.fmtDowLong(days[6]), " ", S.fmt.fmtDay(days[6]), " ", S.fmt.fmtMon(days[6]))),
        React.createElement("button", { className: "snacktoggle snacktoggle--lead", "data-on": state.showSnacks === false ? 0 : 1, onClick: () => S.actions.toggleSnacks(), title: "Snacks tonen of verbergen" },
          React.createElement(Icon, { name: state.showSnacks === false ? "x" : "check", size: 14 }), React.createElement("span", null, "Snacks")),
        React.createElement("button", { className: "sharetrigger sharetrigger--inline", onClick: () => openShare && openShare("week"), title: "Weekmenu delen" },
          React.createElement(Icon, { name: "share", size: 15 }), "Deel")),
      React.createElement("div", { className: "weeknav" },
        React.createElement("button", { className: "sharetrigger sharetrigger--nav", onClick: () => openShare && openShare("week"), title: "Weekmenu delen" },
          React.createElement(Icon, { name: "share", size: 15 }), "Deel"),
        React.createElement("button", { className: "snacktoggle snacktoggle--navmob", "data-on": state.showSnacks === false ? 0 : 1, onClick: () => S.actions.toggleSnacks(), title: "Snacks tonen of verbergen" },
          React.createElement(Icon, { name: state.showSnacks === false ? "x" : "check", size: 14 }), React.createElement("span", null, "Snacks")),
        React.createElement("button", { className: "weeknav__btn", onClick: () => S.actions.shiftWeek(-1), title: "Vorige week", "aria-label": "Vorige week" },
          React.createElement(Icon, { name: "chevL", size: 18 })),
        React.createElement("div", { className: "weeknav__label", onClick: () => offset !== 0 && S.actions.gotoCurrentWeek(), "data-now": offset === 0 ? 1 : 0 },
          React.createElement("span", { className: "weeknav__rel" }, relLabel),
          offset !== 0 && React.createElement("span", { className: "weeknav__back" }, "ga naar nu")),
        React.createElement("button", { className: "weeknav__btn", onClick: () => S.actions.shiftWeek(1), title: "Volgende week", "aria-label": "Volgende week" },
          React.createElement(Icon, { name: "chevR", size: 18 })))
    ),
    swapBanner,
    showOnboarding && filled === 0 && React.createElement("div", { className: "onboarding-banner" },
      React.createElement("button", { className: "onboarding-banner__close", onClick: dismissOnboarding, title: "Sluiten" }, React.createElement(Icon, { name: "x", size: 16 })),
      React.createElement("div", { className: "onboarding-banner__title" }, React.createElement(Icon, { name: "spark", size: 18 }), "Welkom bij Mise en Place!"),
      React.createElement("div", { className: "onboarding-banner__steps" },
        React.createElement("div", { className: "onboarding-step" },
          React.createElement("div", { className: "onboarding-step__num" }, "1"),
          React.createElement("div", null, React.createElement("b", null, "Voeg recepten toe"), React.createElement("br"), "Via het tabblad Recepten — importeer via URL of maak zelf aan")),
        React.createElement("div", { className: "onboarding-step" },
          React.createElement("div", { className: "onboarding-step__num" }, "2"),
          React.createElement("div", null, React.createElement("b", null, "Plan je week"), React.createElement("br"), "Klik op een leeg vakje om een recept in te plannen")),
        React.createElement("div", { className: "onboarding-step" },
          React.createElement("div", { className: "onboarding-step__num" }, "3"),
          React.createElement("div", null, React.createElement("b", null, "Doe boodschappen"), React.createElement("br"), "Je boodschappenlijst wordt automatisch aangemaakt"))),
      React.createElement("button", { className: "btn btn--soft", style: { marginTop: 16 }, onClick: dismissOnboarding }, "Begrepen, toon niet meer")),
    aibar,
    layout === "desktop" ? matrix : React.createElement("div", { className: "weekdays" }, days.map(MobileDay)),
    weeklimits,
    layout === "desktop" && React.createElement("div", { style: { marginTop: 14, fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 } },
      React.createElement(Icon, { name: "grip", size: 16 }), "Tip: sleep een gerecht naar een ander vakje om te wisselen.")
  );
}
window.WeekScreen = WeekScreen;
