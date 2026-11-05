/*
 * Light/dark theme handling.
 *
 * - The initial theme is set by an inline script in <head> (no flash).
 * - The header button toggles it and remembers the choice in localStorage.
 * - With no stored choice, the site follows the OS setting, live.
 * - On every change a `themechange` event is fired on `document`, so page
 *   scripts (e.g. canvas simulations) can redraw with new colours.
 * - Plotly figures: create them with `SiteTheme.plot(el, data, layout, config)`
 *   instead of `Plotly.newPlot`. They get theme colours on creation and are
 *   re-coloured automatically when the theme changes.
 */
(function () {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      const t = localStorage.getItem("theme");
      return t === "light" || t === "dark" ? t : null;
    } catch (e) {
      return null;
    }
  }

  function current() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function apply(theme, persist) {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* private mode */ }
    }
    restyleAllPlots();
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  // ---------- Plotly ----------

  // Flat list of Plotly "attribute paths" -> colours for the current theme,
  // covering 2D axes, 3D scenes, sliders and buttons present in `layout`.
  function plotlyUpdates(layout) {
    const text = cssVar("--text");
    const muted = cssVar("--muted");
    const grid = cssVar("--plot-grid");
    const surface = cssVar("--surface");
    const border = cssVar("--border");
    const u = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      "font.color": text,
      "title.font.color": text,
      "legend.font.color": text,
      "hoverlabel.bgcolor": surface,
      "hoverlabel.font.color": text,
      "hoverlabel.bordercolor": border,
    };
    const axis = (prefix) => {
      u[prefix + ".gridcolor"] = grid;
      u[prefix + ".zerolinecolor"] = muted;
      u[prefix + ".linecolor"] = muted;
      u[prefix + ".tickcolor"] = muted;
    };
    const keys = Object.keys(layout || {});
    keys.filter((k) => /^[xy]axis\d*$/.test(k)).forEach(axis);
    if (!keys.some((k) => /^[xy]axis/.test(k)) && !keys.some((k) => /^scene/.test(k))) {
      axis("xaxis");
      axis("yaxis");
    }
    keys.filter((k) => /^scene\d*$/.test(k)).forEach((s) => {
      ["xaxis", "yaxis", "zaxis"].forEach((a) => {
        axis(`${s}.${a}`);
        u[`${s}.${a}.backgroundcolor`] = "rgba(0,0,0,0)";
      });
    });
    (layout?.sliders || []).forEach((_, i) => {
      const p = `sliders[${i}]`;
      u[`${p}.font.color`] = text;
      u[`${p}.currentvalue.font.color`] = text;
      u[`${p}.bgcolor`] = surface;
      u[`${p}.activebgcolor`] = muted;
      u[`${p}.bordercolor`] = border;
      u[`${p}.tickcolor`] = muted;
    });
    (layout?.updatemenus || []).forEach((_, i) => {
      const p = `updatemenus[${i}]`;
      u[`${p}.font.color`] = text;
      u[`${p}.bgcolor`] = surface;
      u[`${p}.bordercolor`] = border;
    });
    return u;
  }

  // Write "a.b[0].c" style paths into a nested object.
  function setPath(obj, path, value) {
    const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (o[k] == null || typeof o[k] !== "object") o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      o = o[k];
    }
    o[parts[parts.length - 1]] = value;
  }

  function themedLayout(layout) {
    const out = structuredClone(layout || {});
    for (const [path, value] of Object.entries(plotlyUpdates(out))) setPath(out, path, value);
    return out;
  }

  function plot(el, data, layout, config) {
    const target = typeof el === "string" ? document.getElementById(el) : el;
    return Plotly.newPlot(target, data, themedLayout(layout), { responsive: true, ...config });
  }

  function restyleAllPlots() {
    if (!window.Plotly) return;
    document.querySelectorAll(".js-plotly-plot").forEach((el) => {
      Plotly.relayout(el, plotlyUpdates(el.layout));
    });
  }

  // ---------- wiring ----------

  window.SiteTheme = { current, cssVar, plot, themedLayout, set: (t) => apply(t, true) };

  media.addEventListener("change", (e) => {
    if (!storedTheme()) apply(e.matches ? "dark" : "light", false);
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) =>
      btn.addEventListener("click", () => apply(current() === "dark" ? "light" : "dark", true))
    );
  });
})();
