(() => {
  'use strict';
  const presets = window.STYLE_PRESETS;
  if (!Array.isArray(presets) || presets.length !== 100) throw new Error('Expected 100 presets');
  const $ = id => document.getElementById(id);
  const el = {
    list: $('presetList'), filters: $('filters'), search: $('search'), count: $('resultCount'),
    preview: $('preview'), content: $('siteContent'), rail: $('rail'), backdrop: $('railBackdrop'),
    favorite: $('favoriteBtn'), recipeTitle: $('recipeTitle'), recipeDescription: $('recipeDescription'),
    tags: $('recipeTags'), toast: $('toast')
  };
  const state = { current: '001', category: 'All', search: '', paused: false, favorites: loadFavorites() };
  const categoryOrder = ['All', 'Dark', 'Minimal', 'Editorial', 'Bold', 'Tech', 'Organic', 'Playful', 'Retro', 'Experimental', 'Saved'];
  function loadFavorites() {
    try { const raw = JSON.parse(localStorage.getItem('style-vault-favorites') || '[]'); return new Set(Array.isArray(raw) ? raw.filter(x => /^\d{3}$/.test(x)) : []); }
    catch { return new Set(); }
  }
  function saveFavorites() { try { localStorage.setItem('style-vault-favorites', JSON.stringify([...state.favorites])); } catch {} }
  function currentPreset() { return presets.find(p => p.id === state.current) || presets[0]; }
  function filteredPresets() {
    return presets.filter(p => (state.category === 'All' || (state.category === 'Saved' ? state.favorites.has(p.id) : p.category === state.category)) &&
      `${p.name} ${p.category} ${p.description} ${p.layout}`.toLowerCase().includes(state.search));
  }
  function renderFilters() {
    el.filters.replaceChildren();
    for (const category of categoryOrder) {
      const button = document.createElement('button'); button.className = 'filter' + (state.category === category ? ' active' : '');
      button.textContent = category === 'Saved' ? '♡ Saved' : category;
      button.type = 'button'; button.setAttribute('aria-pressed', String(state.category === category));
      button.addEventListener('click', () => { state.category = category; renderFilters(); renderList(); });
      el.filters.append(button);
    }
  }
  function renderList() {
    const matches = filteredPresets(); el.count.textContent = String(matches.length);
    el.list.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('p'); empty.textContent = 'No matching styles. Try another search.';
      empty.style.cssText = 'padding:18px 10px;color:#aaa;font-size:12px'; el.list.append(empty); return;
    }
    const fragment = document.createDocumentFragment();
    for (const p of matches) {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'preset-item' + (p.id === state.current ? ' active' : '');
      b.setAttribute('aria-current', p.id === state.current ? 'true' : 'false');
      b.innerHTML = `<span class="swatch" style="background:linear-gradient(140deg,${p.bg},${p.surface});--swatch-accent:${p.accent}"></span><span class="preset-item-text"><strong></strong><small></small></span><span class="preset-number">${p.id}</span>`;
      b.querySelector('strong').textContent = p.name;
      b.querySelector('small').textContent = `${p.category} · ${p.variant}`;
      b.addEventListener('click', () => selectPreset(p.id)); fragment.append(b);
    }
    el.list.append(fragment);
  }
  function selectPreset(id, opts = {}) {
    const p = presets.find(x => x.id === id); if (!p) return;
    state.current = id;
    const vars = { '--p-bg': p.bg, '--p-surface': p.surface, '--p-accent': p.accent, '--p-secondary': p.secondary, '--p-text': p.text, '--p-font': `'${p.font}'` };
    for (const [key, value] of Object.entries(vars)) el.preview.style.setProperty(key, value);
    el.preview.dataset.layout = p.layout; el.preview.dataset.surface = p.surfaceStyle; el.preview.dataset.motion = p.motion;
    el.preview.dataset.family = p.family;
    $('crumb').textContent = p.name; $('counterCurrent').textContent = p.id.slice(1); $('tabId').textContent = p.id; $('recipeNumber').textContent = p.id;
    el.recipeTitle.textContent = p.name; el.recipeDescription.textContent = `${p.description}. ${p.layoutDescription}.`;
    el.tags.replaceChildren();
    for (const tag of [p.category, p.font, `${p.layout} layout`, `${p.motion} motion`]) {
      const span = document.createElement('span'); span.textContent = tag; el.tags.append(span);
    }
    el.favorite.innerHTML = state.favorites.has(id) ? '♥ <span>Saved</span>' : '♡ <span>Save</span>';
    el.favorite.setAttribute('aria-pressed', String(state.favorites.has(id)));
    el.preview.classList.toggle('motion-paused', state.paused);
    replayMotion(); renderList();
    if (!opts.silent && window.innerWidth <= 920) closeRail();
    history.replaceState(null, '', `#style-${id}`);
  }
  function replayMotion() {
    el.content.style.animation = 'none';
    void el.content.offsetWidth;
    el.content.style.animation = '';
  }
  function cssTokens(p) {
    return `/* Style Vault ${p.id}: ${p.name} */\n/* ${p.description}. Composition: ${p.layoutDescription}. */\n:root {\n  --background: ${p.bg};\n  --surface: ${p.surface};\n  --accent: ${p.accent};\n  --accent-secondary: ${p.secondary};\n  --foreground: ${p.text};\n  --font-display: '${p.font}', sans-serif;\n}\n\n/* Use these variables consistently in your site. */\nbody { background: var(--background); color: var(--foreground); font-family: var(--font-display); }\n.panel { background: var(--surface); }\n.accent { color: var(--accent); }\n`;
  }
  function prompt(p) {
    return `BUILD A WEBSITE IN THIS DESIGN STYLE\n\nSTYLE: ${p.name} (Style Vault #${p.id})\nDESIGN DIRECTION: ${p.description}.\nLAYOUT: ${p.layoutDescription}. Use the "${p.layout}" composition as the page's structural basis, and ensure the layout reorganizes cleanly on mobile.\nVISUAL SYSTEM: ${p.surfaceStyle} card treatment, ${p.motion} motion language.\nTYPOGRAPHY: ${p.font}. Use expressive type scale, tight but readable headline tracking, and clear typographic hierarchy.\n\nCOLOR TOKENS:\n- Page background: ${p.bg}\n- Elevated surface: ${p.surface}\n- Primary accent: ${p.accent}\n- Secondary accent: ${p.secondary}\n- Primary foreground: ${p.text}\n\nART DIRECTION:\n- Use precise spacing, considered whitespace, polished CTA states, and visual hierarchy.\n- Incorporate the named motion language (${p.motion}) across hero visuals, reveals, or microinteractions where appropriate.\n- Design a distinct hero, navigation, benefit cards, proof or showcase sections, and a strong final CTA.\n- Maintain accessible contrast and visible keyboard focus, honor prefers-reduced-motion, avoid animation-induced layout shifts.\n- Support mobile, tablet, and desktop. Use semantic HTML and fast-loading assets.\n- Keep animation performant, preferring transform and opacity over layout properties.\n- Adapt text and content to my actual product and audience. Do not use generic placeholder copy in the final site.\n\nIMPLEMENTATION:\nUse the existing project's stack and conventions. If starting fresh, use semantic HTML, modern CSS, and vanilla JavaScript. Create reusable CSS design tokens and components. No heavy animation library unless genuinely necessary.\n\nDESIGN TOKENS:\n${cssTokens(p)}\n\nReturn the actual working implementation with responsive styling, interactions, and motion. Do not merely describe the design.`;
  }
  async function copy(text, success) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea'); area.value = text; area.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(area); area.focus(); area.select();
        if (!document.execCommand('copy')) throw Error('Copy unsupported'); area.remove();
      }
      toast(success);
    } catch { toast('Clipboard unavailable. Open the site via localhost or HTTPS.'); }
  }
  let toastTimer;
  function toast(message) { el.toast.textContent = message; el.toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.toast.classList.remove('visible'), 2800); }
  function downloadRecipe() {
    const p = currentPreset();
    const content = JSON.stringify({ ...p, agentPrompt: prompt(p), cssTokens: cssTokens(p) }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `style-vault-${p.id}-${p.family}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500); toast('Recipe downloaded');
  }
  function openRail() { el.rail.classList.add('open'); el.backdrop.classList.add('open'); }
  function closeRail() { el.rail.classList.remove('open'); el.backdrop.classList.remove('open'); }
  function toggleFavorite() {
    state.favorites.has(state.current) ? state.favorites.delete(state.current) : state.favorites.add(state.current);
    saveFavorites(); selectPreset(state.current, { silent: true }); renderFilters(); toast(state.favorites.has(state.current) ? 'Saved to favorites' : 'Removed from favorites');
  }
  $('copyPrompt').addEventListener('click', () => copy(prompt(currentPreset()), 'Coding agent prompt copied'));
  $('copyPromptTop').addEventListener('click', () => copy(prompt(currentPreset()), 'Coding agent prompt copied'));
  $('copyCss').addEventListener('click', () => copy(cssTokens(currentPreset()), 'CSS design tokens copied'));
  $('downloadBtn').addEventListener('click', downloadRecipe);
  el.favorite.addEventListener('click', toggleFavorite);
  $('randomBtn').addEventListener('click', () => selectPreset(presets[Math.floor(Math.random() * presets.length)].id));
  $('replayBtn').addEventListener('click', () => { replayMotion(); toast('Motion replayed'); });
  $('motionBtn').addEventListener('click', () => {
    state.paused = !state.paused; el.preview.classList.toggle('motion-paused', state.paused);
    $('motionBtn').innerHTML = state.paused ? '▷ <span>Play motion</span>' : '◉ <span>Pause motion</span>';
    $('motionBtn').setAttribute('aria-pressed', String(state.paused));
  });
  el.search.addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); renderList(); });
  $('openRail').addEventListener('click', openRail); $('closeRail').addEventListener('click', closeRail);
  el.backdrop.addEventListener('click', closeRail);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRail();
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); openRail(); el.search.focus(); }
  });
  for (const id of ['demoCta','demoSecondary','siteNavCta']) $(id).addEventListener('click', () => toast('Demo interaction · ' + currentPreset().name));
  window.addEventListener('hashchange', () => { const id = location.hash.match(/^#style-(\d{3})$/)?.[1]; if (id && id !== state.current) selectPreset(id, { silent: true }); });
  renderFilters(); const initial = location.hash.match(/^#style-(\d{3})$/)?.[1]; selectPreset(initial || '001', { silent: true });
})();
