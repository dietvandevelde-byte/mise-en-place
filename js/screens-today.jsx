/* =========================================================================
   MEAL PLANNER — Today screen
   ========================================================================= */
function TodayScreen({ layout, openSlot, openSnacks, toast }) {
  const state = useStore();
  const [focus, setFocus] = useState(state.today);
  const days = S.fmt.daysFor(S.sel.currentWeekStart());
  const totals = S.sel.dayTotals(focus, true);
  const eaten = totals.eaten;
  const max = state.targets.maxKcal;
  const isToday = focus === state.today;
  const showSnacks = state.showSnacks !== false;
  const compact = layout === "mobile";   // mobile dashboard is ~half height

  // ordered items: main meals (0,2,4) + one combined snacks line — respecting eaten/te-gaan split
  const snackSum = S.sel.snackSummary(focus);
  const baseItems = [{ kind: "meal", slot: 0 }, { kind: "meal", slot: 2 }, { kind: "meal", slot: 4 }];
  if (showSnacks) baseItems.push({ kind: "snacks" });
  const itemEaten = (it) => it.kind === "snacks" ? (snackSum.count > 0 && snackSum.eaten) : (() => { const es = S.sel.mealEntries(focus, it.slot); return es.length > 0 && es.every((e) => e.eaten); })();
  const itemFilled = (it) => it.kind === "snacks" ? snackSum.count > 0 : S.sel.slotFilled(focus, it.slot);

  const rows = [];
  let insertedDivider = false, sawEaten = false;
  baseItems.forEach((it, idx) => {
    const isEaten = itemEaten(it);
    if (!isEaten && sawEaten && !insertedDivider) {
      const remaining = baseItems.slice(idx).filter((x) => !itemEaten(x)).length;
      rows.push({ divider: true, label: "Nog te gaan", count: remaining });
      insertedDivider = true;
    }
    if (isEaten) sawEaten = true;
    rows.push(it);
  });

  function SlotRow({ slot }) {
    const meta = window.MP.SLOTS[slot];
    const dishes = S.sel.mealRows(focus, slot).map((x) => x.e);
    const filled = dishes.length > 0;
    if (!filled) {
      return React.createElement("div", { className: "slot slot--empty", "data-c": meta.color },
        React.createElement("div", { className: "slot__spine", style: { background: "var(--line-2)" } }),
        React.createElement("div", { className: "slot__body", onClick: () => openSlot(focus, slot) },
          React.createElement("div", { className: "slot__meal" }, React.createElement("span", { className: "slot__meal-name" }, meta.name)),
          React.createElement("div", { className: "slot__add" }, React.createElement(Icon, { name: "plus", size: 18 }), "Iets inplannen")),
        React.createElement("div", { className: "slot__right" })
      );
    }
    const single = dishes.length === 1 ? dishes[0] : null;
    const recipe = single && single.recipeId ? S.sel.recipeById(single.recipeId) : null;
    const status = single && single.status ? window.MP.statusByKey(single.status) : null;
    const n = single && single.recipeId ? S.entryNutrition(single) : null;
    const totalKcal = dishes.reduce((a, e) => a + (e.recipeId ? S.entryNutrition(e).kcal : 0), 0);
    const allEaten = dishes.every((e) => e.eaten);
    const anyMeat = dishes.some((e) => { const r = e.recipeId && S.sel.recipeById(e.recipeId); return r && r.meatDish; });
    const names = dishes.map((e) => { const r = e.recipeId ? S.sel.recipeById(e.recipeId) : null; const st = e.status ? window.MP.statusByKey(e.status) : null; return r ? r.title : st ? st.name : e.manualName; });
    const noteText = dishes.map((e) => e.note).filter(Boolean).join(" \u00b7 ");
    const eatenCount = dishes.filter((e) => e.eaten).length;
    return React.createElement("div", { className: "slot" + (single && (status || !recipe) ? " slot--alt" : ""), "data-c": meta.color, "data-eaten": allEaten ? 1 : 0 },
      React.createElement("div", { className: "slot__spine" }),
      React.createElement("div", { className: "slot__body", onClick: () => openSlot(focus, slot) },
        React.createElement("div", { className: "slot__meal" },
          React.createElement("span", { className: "slot__meal-name" }, meta.name),
          dishes.length > 1 && React.createElement("span", { className: "slot__time" }, dishes.length, " gerechten"),
          anyMeat && React.createElement(Icon, { name: "meat", size: 12, style: { color: "var(--ink-4)" } })),
        React.createElement("div", { className: "slot__title", style: dishes.length > 1 ? { fontSize: "var(--fs-16)" } : null },
          single && status && React.createElement(Icon, { name: status.icon, size: 16, style: { color: "var(--ink-3)", verticalAlign: "-2px", marginRight: 6, display: "inline-block" } }),
          names.join(" \u00b7 ")),
        React.createElement("div", { className: "slot__meta" },
          totalKcal > 0 && React.createElement("span", null, React.createElement("b", null, totalKcal), " kcal"),
          single && recipe && React.createElement(React.Fragment, null,
            React.createElement("span", { className: "dotsep" }),
            React.createElement("span", null, fmtPortions(single.portions))),
          single && recipe && React.createElement(React.Fragment, null,
            React.createElement("span", { className: "dotsep" }),
            React.createElement("span", null, n.protein, "g eiw")),
          dishes.length > 1 && React.createElement(React.Fragment, null,
            React.createElement("span", { className: "dotsep" }),
            React.createElement("span", null, eatenCount, "/", dishes.length, " gegeten")),
          noteText && React.createElement("span", { className: "slot__note" }, React.createElement(Icon, { name: "note", size: 12 }), noteText))
      ),
      React.createElement("div", { className: "slot__right" },
        React.createElement("button", { className: "eatbtn", "data-on": allEaten ? 1 : 0, title: allEaten ? "Gegeten" : "Markeer gegeten",
          onClick: () => { S.actions.toggleEaten(focus, slot); toast(allEaten ? "Teruggezet" : "Gegeten \u2713"); } },
          React.createElement(Icon, { name: "check", size: 17 })),
        React.createElement("button", { className: "kebab", onClick: () => openSlot(focus, slot), title: "Bewerken" },
          React.createElement(Icon, { name: "edit", size: 17 }))
      )
    );
  }

  function SnacksRow() {
    const filled = snackSum.count > 0;
    if (!filled) {
      return React.createElement("div", { className: "slot slot--empty", "data-c": "sage" },
        React.createElement("div", { className: "slot__spine", style: { background: "var(--line-2)" } }),
        React.createElement("div", { className: "slot__body", onClick: () => openSnacks(focus) },
          React.createElement("div", { className: "slot__meal" }, React.createElement("span", { className: "slot__meal-name" }, "Snacks")),
          React.createElement("div", { className: "slot__add" }, React.createElement(Icon, { name: "plus", size: 18 }), "Snack toevoegen")),
        React.createElement("div", { className: "slot__right" }));
    }
    const allEaten = snackSum.eaten;
    return React.createElement("div", { className: "slot slot--alt", "data-c": "sage", "data-eaten": allEaten ? 1 : 0 },
      React.createElement("div", { className: "slot__spine" }),
      React.createElement("div", { className: "slot__body", onClick: () => openSnacks(focus) },
        React.createElement("div", { className: "slot__meal" },
          React.createElement("span", { className: "slot__meal-name" }, "Snacks"),
          React.createElement("span", { className: "slot__time" }, snackSum.count, snackSum.count === 1 ? " item" : " items")),
        React.createElement("div", { className: "slot__title", style: { fontSize: "var(--fs-16)" } }, snackSum.names.join(" · ")),
        React.createElement("div", { className: "slot__meta" },
          React.createElement("span", null, React.createElement("b", null, snackSum.kcal), " kcal"),
          React.createElement("span", { className: "dotsep" }),
          React.createElement("span", null, snackSum.eatenCount, "/", snackSum.count, " gegeten"))),
      React.createElement("div", { className: "slot__right" },
        React.createElement("button", { className: "eatbtn", "data-on": allEaten ? 1 : 0, title: "Alle snacks (on)gegeten",
          onClick: () => { S.actions.setSnacksEaten(focus, !allEaten); toast(allEaten ? "Teruggezet" : "Gegeten ✓"); } },
          React.createElement(Icon, { name: "check", size: 17 })),
        React.createElement("button", { className: "kebab", onClick: () => openSnacks(focus), title: "Snacks bewerken" },
          React.createElement(Icon, { name: "edit", size: 17 }))));
  }

  const dash = React.createElement("div", { className: "dash" + (compact ? " dash--compact" : "") },
    React.createElement("div", { className: "dash__eyebrow" },
      React.createElement("span", { className: "t-eyebrow" }, isToday ? "Vandaag gegeten" : "Gegeten"),
      React.createElement("span", { className: "t-eyebrow", style: { color: "var(--ink-4)" } }, totals.eatenCount, "/", totals.slotCount, " maaltijden")),
    React.createElement("div", { className: "dash__body" },
      React.createElement("div", { className: "dash__gaugewrap" },
        React.createElement(Gauge, { value: eaten.kcal, max, size: compact ? 146 : 208 }),
        (function () {
          const frac = eaten.kcal / max;
          const z = frac > 1.001 ? "over" : frac >= 0.85 ? "warn" : "ok";
          const label = z === "over" ? "Boven dagmaximum" : z === "warn" ? "Bijna op je max" : "Ruim binnen je doel";
          return React.createElement("div", { className: "statuspill", "data-z": z }, label);
        })()
      ),
      React.createElement("div", { className: "macros" },
        React.createElement(MacroDonut, { carbs: eaten.carbs, protein: eaten.protein, fat: eaten.fat, size: compact ? 78 : 116 }),
        React.createElement("div", { className: "macros__legend" },
          [[compact ? "Koolh." : "Koolhydraten", eaten.carbs, "var(--macro-carb)"], [compact ? "Eiwit" : "Eiwitten", eaten.protein, "var(--macro-prot)"], [compact ? "Vet" : "Vetten", eaten.fat, "var(--macro-fat)"]].map(([nm, g, c], i) => {
            const kc = (i === 2 ? g * 9 : g * 4);
            const totKc = eaten.carbs * 4 + eaten.protein * 4 + eaten.fat * 9 || 1;
            return React.createElement("div", { key: i, className: "mleg" },
              React.createElement("div", { className: "mleg__sw", style: { background: c } }),
              React.createElement("div", { className: "mleg__name" }, nm),
              React.createElement("div", { className: "mleg__val" }, g, "g ", React.createElement("span", null, Math.round(kc / totKc * 100), "%")));
          })
        )
      )
    )
  );

  const slotsCol = React.createElement("div", null,
    React.createElement("div", { className: "slots" },
      rows.map((r, i) => r.divider
        ? React.createElement("div", { key: "d" + i, className: "dividerlbl" },
            React.createElement("span", { className: "dividerlbl__t" }, r.label),
            React.createElement("span", { className: "dividerlbl__line" }),
            React.createElement("span", { className: "dividerlbl__count" }, r.count))
        : r.kind === "snacks"
          ? React.createElement(SnacksRow, { key: "snacks" })
          : React.createElement(SlotRow, { key: r.slot, slot: r.slot }))
    )
  );

  return React.createElement("div", { className: "wrap" },
    React.createElement("div", { className: "today__stickhead" },
      React.createElement("div", { className: "shead" },
        React.createElement("div", null,
          React.createElement("h1", { className: "shead__title" }, isToday ? "Vandaag" : cap(S.fmt.fmtDowLong(focus))),
          React.createElement("div", { className: "shead__sub" },
            cap(S.fmt.fmtDowLong(focus)), " ", S.fmt.fmtDay(focus), " ", S.fmt.fmtMon(focus),
            " · ", React.createElement("b", null, eaten.kcal, " kcal"), " van ", max)),
        React.createElement("button", { className: "snacktoggle", "data-on": state.showSnacks === false ? 0 : 1, onClick: () => S.actions.toggleSnacks(), title: "Snacks tonen of verbergen" },
          React.createElement(Icon, { name: state.showSnacks === false ? "x" : "check", size: 14 }),
          "Snacks")),
      React.createElement("div", { className: "weekstrip" },
        days.map((d) => React.createElement("button", { key: d, className: "wsday", "data-today": d === focus ? 1 : 0, onClick: () => setFocus(d) },
          React.createElement("span", null, S.fmt.fmtDow(d)),
          React.createElement("b", null, S.fmt.fmtDay(d)))))
    ),
    React.createElement("div", { className: "today screen-anim" },
      React.createElement("div", { className: "today__rail" }, dash),
      slotsCol)
  );
}
window.TodayScreen = TodayScreen;
