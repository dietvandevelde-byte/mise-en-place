/* =========================================================================
   MEAL PLANNER — shared components & hooks
   ========================================================================= */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const S = window.MPStore;

function useStore() {
  return React.useSyncExternalStore(S.subscribe, S.getState);
}

/* ---- small helpers ---- */
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
/* Dutch number: decimal comma, drop trailing .0 */
function nlNum(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }
/* "1,7 porties" / "1 portie" */
function fmtPortions(p) { return nlNum(p) + " " + (p === 1 ? "portie" : "porties"); }
function fmtQty(q, unit) {
  if (q == null) return "";
  let n = Math.round(q * 100) / 100;
  // pretty fractions for common halves/quarters
  const frac = { 0.25: "¼", 0.5: "½", 0.75: "¾" };
  const whole = Math.floor(n);
  const rem = Math.round((n - whole) * 100) / 100;
  let txt;
  if (frac[rem]) txt = (whole ? whole : "") + frac[rem];
  else txt = String(n);
  return unit ? `${txt} ${unit}` : txt;
}

/* ============================ Radial calorie gauge ============================ */
function ptOnArc(cx, cy, r, deg) {
  const a = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx, cy, r, start, end) {
  const s = ptOnArc(cx, cy, r, start), e = ptOnArc(cx, cy, r, end);
  const large = (end - start) <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}
function Gauge({ value, max, size = 208 }) {
  const SW = Math.round(size * 0.085);
  const r = (size - SW) / 2 - 2;
  const cx = size / 2, cy = size / 2;
  const START = 225, SWEEP = 270;
  const frac = max > 0 ? value / max : 0;
  const shown = Math.max(0, Math.min(1, frac));
  const zone = frac > 1.001 ? "over" : frac >= 0.85 ? "warn" : "ok";
  const color = zone === "over" ? "var(--danger)" : zone === "warn" ? "var(--warn)" : "var(--brand)";
  const valEnd = START + SWEEP * (shown || 0.0001);
  const remaining = Math.max(0, Math.round(max - value));
  const numSize = Math.round(size * (size < 172 ? 0.215 : 0.27));
  return (
    React.createElement("div", { className: "gauge", style: { width: size, height: size } },
      React.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
        React.createElement("path", { d: describeArc(cx, cy, r, START, START + SWEEP), fill: "none", stroke: "var(--paper-2)", strokeWidth: SW, strokeLinecap: "round" }),
        React.createElement("path", { d: describeArc(cx, cy, r, START, valEnd), fill: "none", stroke: color, strokeWidth: SW, strokeLinecap: "round", style: { transition: "all .5s cubic-bezier(.2,.8,.2,1)" } }),
        // tick at 100%
        (function () {
          const p1 = ptOnArc(cx, cy, r + SW / 2 + 3, START + SWEEP);
          const p2 = ptOnArc(cx, cy, r - SW / 2 - 3, START + SWEEP);
          return React.createElement("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "var(--ink-4)", strokeWidth: 2 });
        })()
      ),
      React.createElement("div", { className: "gauge__center" },
        React.createElement("div", { className: "gauge__num", style: { fontSize: numSize, color: zone === "over" ? "var(--danger)" : "var(--ink)" } }, value.toLocaleString("nl-NL")),
        React.createElement("div", { className: "gauge__unit" }, "kcal gegeten"),
        React.createElement("div", { className: "gauge__sub" },
          zone === "over"
            ? React.createElement(React.Fragment, null, React.createElement("b", null, (value - max).toLocaleString("nl-NL")), " kcal boven max")
            : React.createElement(React.Fragment, null, "nog ", React.createElement("b", null, remaining.toLocaleString("nl-NL")), " van ", max.toLocaleString("nl-NL"))
        )
      )
    )
  );
}

/* ============================ Macro donut ============================ */
function MacroDonut({ carbs, protein, fat, size = 120 }) {
  const kc = carbs * 4, kp = protein * 4, kf = fat * 9;
  const total = kc + kp + kf || 1;
  const segs = [
    { v: kc, c: "var(--macro-carb)" },
    { v: kp, c: "var(--macro-prot)" },
    { v: kf, c: "var(--macro-fat)" },
  ];
  const SW = Math.round(size * 0.18);
  const r = (size - SW) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return React.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { transform: "rotate(-90deg)" } },
    React.createElement("circle", { cx, cy, r, fill: "none", stroke: "var(--paper-2)", strokeWidth: SW }),
    segs.map((s, i) => {
      const len = (s.v / total) * circ;
      const el = React.createElement("circle", {
        key: i, cx, cy, r, fill: "none", stroke: s.c, strokeWidth: SW,
        strokeDasharray: `${Math.max(0, len - 2)} ${circ}`, strokeDashoffset: -offset,
        style: { transition: "all .5s cubic-bezier(.2,.8,.2,1)" },
      });
      offset += len;
      return el;
    })
  );
}

/* ============================ Sheet / dialog ============================ */
function Sheet({ eyebrow, eyebrowColor, title, onClose, children, foot, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const content = React.createElement("div", { className: "ov", onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    React.createElement("div", { className: "sheet" + (wide ? " sheet--wide" : ""), "data-c": eyebrowColor || undefined },
      React.createElement("div", { className: "sheet__grip" }),
      React.createElement("div", { className: "sheet__head" },
        React.createElement("div", { className: "sheet__head-l" },
          eyebrow && React.createElement("div", { className: "sheet__eyebrow" }, eyebrow),
          React.createElement("div", { className: "sheet__title" }, title)
        ),
        React.createElement("button", { className: "sheet__close", onClick: onClose, "aria-label": "Sluiten" },
          React.createElement(Icon, { name: "x", size: 18 }))
      ),
      React.createElement("div", { className: "sheet__body" }, children),
      foot && React.createElement("div", { className: "sheet__foot" }, foot)
    )
  );
  // Render via portal so position:fixed works correctly even inside CSS transform ancestors
  return ReactDOM.createPortal(content, document.body);
}

/* ============================ Stepper ============================ */
function Stepper({ value, onChange, min = 1, max = 12, step = 1, editable = false }) {
  const dec = step < 1;
  const round = (v) => dec ? Math.round(v * 10) / 10 : Math.round(v);
  const clamp = (v) => Math.min(max, Math.max(min, round(v)));
  const [buf, setBuf] = useState(null);
  const display = dec ? String(round(value)).replace(".", ",") : String(value);
  function commit(raw) {
    const parsed = parseFloat(String(raw).replace(",", "."));
    if (!isNaN(parsed)) onChange(clamp(parsed));
    setBuf(null);
  }
  return React.createElement("div", { className: "stepper" },
    React.createElement("button", { onClick: () => onChange(clamp(value - step)), disabled: round(value) <= min, "aria-label": "Minder" }, "−"),
    editable
      ? React.createElement("input", {
          className: "stepper__input", inputMode: "decimal", value: buf != null ? buf : display,
          onChange: (e) => setBuf(e.target.value),
          onBlur: (e) => commit(e.target.value),
          onKeyDown: (e) => { if (e.key === "Enter") e.target.blur(); },
        })
      : React.createElement("div", { className: "stepper__val" }, display),
    React.createElement("button", { onClick: () => onChange(clamp(value + step)), disabled: round(value) >= max, "aria-label": "Meer" }, "+")
  );
}

/* ============================ Toast ============================ */
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    clearTimeout(show._t);
    show._t = setTimeout(() => setMsg(null), 2200);
  }, []);
  const node = msg
    ? React.createElement("div", { className: "toast" }, React.createElement(Icon, { name: "check", size: 16 }), msg)
    : null;
  return [node, show];
}

/* ============================ Image picker ============================ */
function ImagePicker({ value, onChange, height = 168, label = "Foto toevoegen" }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  // capture="environment" opens the phone camera directly; on desktop the browser
  // ignores it and just shows a normal file chooser, so it's safe everywhere.
  const inputs = React.createElement(React.Fragment, null,
    React.createElement("input", { ref: camRef, type: "file", accept: "image/*", capture: "environment", style: { display: "none" }, onChange: pick }),
    React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: pick }));
  return React.createElement("div", { className: "imgpick", style: { height } },
    inputs,
    value
      ? React.createElement(React.Fragment, null,
          React.createElement("img", { src: value, className: "imgpick__img", alt: "" }),
          React.createElement("div", { className: "imgpick__actions" },
            React.createElement("button", { type: "button", className: "imgpick__btn", onClick: () => camRef.current.click() }, React.createElement(Icon, { name: "camera", size: 15 }), "Foto"),
            React.createElement("button", { type: "button", className: "imgpick__btn", onClick: () => fileRef.current.click() }, React.createElement(Icon, { name: "image", size: 15 }), "Bestand"),
            React.createElement("button", { type: "button", className: "imgpick__btn imgpick__btn--del", onClick: () => onChange(null) }, React.createElement(Icon, { name: "trash", size: 15 }))))
      : React.createElement("div", { className: "imgpick__drop" },
          React.createElement("div", { className: "imgpick__icon" }, React.createElement(Icon, { name: "camera", size: 24 })),
          React.createElement("span", null, label),
          React.createElement("small", null, "Maak een foto of kies een bestand"),
          React.createElement("div", { className: "imgpick__choices" },
            React.createElement("button", { type: "button", className: "imgpick__choice imgpick__choice--primary", onClick: () => camRef.current.click() }, React.createElement(Icon, { name: "camera", size: 16 }), "Maak foto"),
            React.createElement("button", { type: "button", className: "imgpick__choice", onClick: () => fileRef.current.click() }, React.createElement(Icon, { name: "image", size: 16 }), "Kies bestand")))
  );
}

/* ============================ Toggle pill ============================ */
function TogglePill({ on, onClick, children, icon }) {
  return React.createElement("button", { className: "togglepill", "data-on": on ? 1 : 0, onClick, type: "button" },
    React.createElement("span", { className: "togglepill__track" }, React.createElement("span", { className: "togglepill__knob" })),
    React.createElement("span", null, children));
}

Object.assign(window, { useStore, cap, fmtQty, nlNum, fmtPortions, Gauge, MacroDonut, Sheet, Stepper, ImagePicker, TogglePill, useToast });
