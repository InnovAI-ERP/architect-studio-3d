/**
 * ARCHITECT STUDIO 3D - Main Application Controller
 * Orchestrates 2D Blueprint, 3D WebGL Studio, UI Panels, Catalog & Metrado
 */

window.ArchApp = (function() {

  function init() {
    console.log("Initializing Architect Studio 3D...");

    // 1. Initialize Renderers
    const container3D = document.getElementById('canvas-3d');
    const container2D = document.getElementById('canvas-viewport');
    const canvas2D = document.getElementById('cad-canvas');

    if (window.ArchRenderer3D && container3D) {
      window.ArchRenderer3D.init(container3D);
    }

    if (window.ArchRenderer2D && canvas2D) {
      window.ArchRenderer2D.init(canvas2D, container2D);
      // Link coordinate HUD
      window.ArchRenderer2D.onCoords((x, y) => {
        const hudCoords = document.getElementById('hud-coords-readout');
        if (hudCoords) {
          hudCoords.textContent = `X: ${x.toFixed(2)}m  Y: ${y.toFixed(2)}m`;
        }
      });
    }

    // 2. Setup Subscriptions to State
    setupStateSubscriptions();

    // 3. Build Catalog & Floor Stacks
    renderFloorStack();
    renderCatalog();

    // 4. Bind UI Event Listeners
    setupUIEvents();
    setupKeyboardShortcuts();

    // 5. Initial View Mode
    updateViewModeUI('3d');
    updateInspector();

    // Try loading saved state
    if (window.ArchState.loadFromStorage()) {
      showToast("Proyecto cargado automáticamente desde memoria local");
    } else {
      showToast("Villa Innova Contemporánea lista para explorar");
    }
  }

  // State Subscriptions
  function setupStateSubscriptions() {
    window.ArchState.subscribe((event, payload, state) => {
      // Re-render views
      if (window.ArchRenderer2D) window.ArchRenderer2D.render();
      if (window.ArchRenderer3D) {
        if (['item:added', 'item:updated', 'item:deleted', 'floor:activated', 'floor:visibility', 'floor:added', 'walls:cutaway', 'project:loaded', 'project:reset', 'project:imported'].includes(event)) {
          window.ArchRenderer3D.rebuildScene();
        } else if (event === 'selection:changed') {
          window.ArchRenderer3D.updateSelection();
        } else if (event === 'lighting:changed') {
          window.ArchRenderer3D.setLightingTime(payload);
        } else if (event === 'camera:preset') {
          window.ArchRenderer3D.setCameraPreset(payload);
        }
      }

      // Update UI panels
      if (['selection:changed', 'item:updated', 'item:added', 'item:deleted', 'room:updated'].includes(event)) {
        updateInspector();
      }

      if (['floor:activated', 'floor:visibility', 'floor:added', 'project:loaded', 'project:reset', 'project:imported'].includes(event)) {
        renderFloorStack();
        updateInspector();
      }

      if (event === 'project:saved') {
        showToast("Proyecto guardado exitosamente en el navegador");
      }
    });
  }

  // ════════ FLOOR MANAGER UI ════════
  function renderFloorStack() {
    const list = document.getElementById('floor-stack-list');
    if (!list) return;

    const state = window.ArchState.getState();
    list.innerHTML = '';

    const reversedFloors = [...state.floors].reverse();

    reversedFloors.forEach(floor => {
      const item = document.createElement('div');
      item.className = `floor-item ${floor.id === state.activeFloorId ? 'active' : ''}`;
      item.onclick = () => window.ArchState.setActiveFloor(floor.id);

      item.innerHTML = `
        <div class="floor-info">
          <div class="floor-dot"></div>
          <div>
            <div class="floor-title">${floor.name}</div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">Elev: +${floor.elevation.toFixed(2)}m • H: ${floor.height.toFixed(2)}m</div>
          </div>
        </div>
        <div class="floor-actions">
          <button class="icon-btn ${floor.visible ? 'active' : ''}" title="Alternar Visibilidad" onclick="event.stopPropagation(); window.ArchState.toggleFloorVisibility('${floor.id}')">
            ${floor.visible ? '👁️' : '🕶️'}
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  // ════════ CATALOG UI ════════
  let activeCatalogCategory = 'all';

  function renderCatalog(searchFilter = '') {
    const container = document.getElementById('catalog-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const items = window.ARCH_CONSTANTS.CATALOG.filter(it => {
      const matchCat = (activeCatalogCategory === 'all' || it.category === activeCatalogCategory);
      const matchSearch = (!searchFilter || it.name.toLowerCase().includes(searchFilter.toLowerCase()) || (it.description && it.description.toLowerCase().includes(searchFilter.toLowerCase())));
      return matchCat && matchSearch;
    });

    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.onclick = () => {
        const newItem = window.ArchState.addItem(it.id, 5.0, 3.5);
        showToast(`Agregado: ${it.name}`);
      };

      let icon = '📦';
      if (it.id.startsWith('stair')) icon = '🪜';
      else if (it.id.startsWith('sofa') || it.id.startsWith('lounge')) icon = '🛋️';
      else if (it.id.startsWith('table') || it.id.startsWith('dining')) icon = '🍽️';
      else if (it.id.startsWith('tv')) icon = '📺';
      else if (it.id.startsWith('lamp') || it.id.startsWith('pendant')) icon = '💡';
      else if (it.id.startsWith('kitchen') || it.id.startsWith('fridge') || it.id.startsWith('oven')) icon = '🍳';
      else if (it.id.startsWith('bed') || it.id.startsWith('wardrobe') || it.id.startsWith('nightstand')) icon = '🛏️';
      else if (it.id.startsWith('vanity') || it.id.startsWith('toilet') || it.id.startsWith('bathtub') || it.id.startsWith('shower')) icon = '🚿';
      else if (it.id.startsWith('plant')) icon = '🌿';
      else if (it.id.startsWith('door')) icon = '🚪';
      else if (it.id.startsWith('window')) icon = '🪟';
      else if (it.id.startsWith('pool') || it.id.startsWith('outdoor')) icon = '🏊';

      card.innerHTML = `
        <div>
          <div class="card-icon">${icon}</div>
          <div class="card-title">${it.name}</div>
        </div>
        <div class="card-dims">${it.width.toFixed(2)}m × ${it.depth.toFixed(2)}m × ${it.height.toFixed(2)}m</div>
      `;
      container.appendChild(card);
    });
  }

  // ════════ RIGHT INSPECTOR PANEL UI ════════
  function updateInspector() {
    const container = document.getElementById('inspector-content');
    if (!container) return;

    const state = window.ArchState.getState();
    const item = window.ArchState.getSelectedItem();
    const activeFloor = window.ArchState.getActiveFloor();

    // Case 1: Item Selected
    if (item && state.selectedType === 'item') {
      container.innerHTML = `
        <div class="prop-group">
          <div class="section-label">Elemento Seleccionado</div>
          <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main); margin-bottom: 2px;">${item.name}</div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-cyan);">ID: ${item.id}</div>
        </div>

        <div class="prop-group">
          <div class="prop-label">Posición en Planta (Metros)</div>
          <div class="prop-grid-3">
            <div class="num-input-wrap">
              <span class="num-prefix">X</span>
              <input type="number" step="0.1" class="num-input" value="${item.x.toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {x: parseFloat(this.value)})">
            </div>
            <div class="num-input-wrap">
              <span class="num-prefix">Y</span>
              <input type="number" step="0.1" class="num-input" value="${item.y.toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {y: parseFloat(this.value)})">
            </div>
            <div class="num-input-wrap">
              <span class="num-prefix">Z</span>
              <input type="number" step="0.1" class="num-input" value="${(item.z || 0).toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {z: parseFloat(this.value)})">
            </div>
          </div>
        </div>

        <div class="prop-group">
          <div class="prop-label">Dimensiones (Ancho × Prof × Alto)</div>
          <div class="prop-grid-3">
            <div class="num-input-wrap">
              <span class="num-prefix">W</span>
              <input type="number" step="0.05" min="0.1" class="num-input" value="${item.width.toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {width: parseFloat(this.value)})">
            </div>
            <div class="num-input-wrap">
              <span class="num-prefix">D</span>
              <input type="number" step="0.05" min="0.1" class="num-input" value="${item.depth.toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {depth: parseFloat(this.value)})">
            </div>
            <div class="num-input-wrap">
              <span class="num-prefix">H</span>
              <input type="number" step="0.05" min="0.1" class="num-input" value="${item.height.toFixed(2)}" onchange="window.ArchState.updateItem('${item.id}', {height: parseFloat(this.value)})">
            </div>
          </div>
        </div>

        <div class="prop-group">
          <div class="prop-label">Rotación</div>
          <div class="slider-wrap">
            <input type="range" min="0" max="360" step="5" class="slider-input" value="${item.rotation || 0}" 
              oninput="this.nextElementSibling.textContent = this.value + '°'; window.ArchState.updateItem('${item.id}', {rotation: parseInt(this.value)}, false)">
            <span class="slider-val">${item.rotation || 0}°</span>
          </div>
          <div class="rot-grid" style="margin-top: 6px;">
            <button class="rot-btn" onclick="window.ArchState.updateItem('${item.id}', {rotation: 0})">0°</button>
            <button class="rot-btn" onclick="window.ArchState.updateItem('${item.id}', {rotation: 90})">90°</button>
            <button class="rot-btn" onclick="window.ArchState.updateItem('${item.id}', {rotation: 180})">180°</button>
            <button class="rot-btn" onclick="window.ArchState.updateItem('${item.id}', {rotation: 270})">270°</button>
          </div>
        </div>

        <div class="prop-group">
          <div class="prop-label">Planta Asignada</div>
          <select class="search-input" onchange="window.ArchState.updateItem('${item.id}', {floorId: this.value})">
            ${state.floors.map(f => `<option value="${f.id}" ${f.id === item.floorId ? 'selected' : ''}>${f.name}</option>`).join('')}
          </select>
        </div>

        <div class="prop-group">
          <div class="prop-label">Acabado / Material</div>
          <div class="mat-grid">
            ${window.ARCH_CONSTANTS.MATERIALS.slice(0, 6).map(m => `
              <button class="mat-btn ${item.material === m.id ? 'active' : ''}" onclick="window.ArchState.updateItem('${item.id}', {material: '${m.id}'})">
                ${m.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="inspector-actions">
          <button class="btn-ctrl" onclick="window.ArchState.duplicateItem('${item.id}')">📋 Duplicar Elemento (Ctrl+D)</button>
          <button class="btn-danger" onclick="window.ArchState.deleteItem('${item.id}')">🗑️ Eliminar Elemento (Supr)</button>
        </div>
      `;
      return;
    }

    // Case 2: No Item Selected -> Show Floor & House Summary
    container.innerHTML = `
      <div class="prop-group">
        <div class="section-label">Planta Activa</div>
        <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${activeFloor.name}</div>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); margin-top: 2px;">
          Nivel: +${activeFloor.elevation.toFixed(2)}m • Altura Techo: ${activeFloor.height.toFixed(2)}m
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-label">Piso de la Planta</div>
        <div class="mat-grid">
          ${window.ARCH_CONSTANTS.MATERIALS.map(m => `
            <button class="mat-btn ${activeFloor.floorMaterial === m.id ? 'active' : ''}" onclick="window.ArchState.updateFloor('${activeFloor.id}', {floorMaterial: '${m.id}'})">
              ${m.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-label">Color de Muros de Planta</div>
        <div class="swatch-grid">
          ${window.ARCH_CONSTANTS.WALL_COLORS.map(c => `
            <button class="swatch-btn ${activeFloor.wallColor === c.hex ? 'active' : ''}" 
              style="background: ${c.hex};" 
              title="${c.name}"
              onclick="window.ArchState.updateFloor('${activeFloor.id}', {wallColor: '${c.hex}'})">
            </button>
          `).join('')}
        </div>
      </div>

      <div class="prop-group" style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <div class="section-label">Resumen Arquitectónico</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 11.5px; color: var(--text-muted);">Área Total Construida:</span>
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--accent-cyan);">${state.stats.totalBuiltAreaM2} m²</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 11.5px; color: var(--text-muted);">Habitaciones/Zonas:</span>
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">${state.stats.totalRooms}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 11.5px; color: var(--text-muted);">Artefactos / Muebles:</span>
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">${state.stats.totalItems}</span>
        </div>
      </div>

      <button class="btn-ctrl btn-gold" onclick="window.ArchApp.openMetradoModal()" style="width: 100%; justify-content: center; padding: 10px;">
        📊 Ver Metrado & Cómputo de Materiales
      </button>
    `;
  }

  // ════════ VIEW SWITCHER (2D / 3D / SPLIT) ════════
  function updateViewModeUI(mode) {
    const viewport = document.getElementById('canvas-viewport');
    const container2D = document.getElementById('canvas-2d');
    const container3D = document.getElementById('canvas-3d');

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === '2d') {
      viewport.classList.remove('split-mode');
      container2D.style.display = 'block';
      container2D.style.left = '0';
      container2D.style.width = '100%';
      container2D.style.zIndex = '5';

      container3D.style.display = 'none';

      setTimeout(() => {
        if (window.ArchRenderer2D) window.ArchRenderer2D.resize();
      }, 50);
    } else if (mode === '3d') {
      viewport.classList.remove('split-mode');
      container2D.style.display = 'none';

      container3D.style.display = 'block';
      container3D.style.left = '0';
      container3D.style.width = '100%';
      container3D.style.zIndex = '5';

      setTimeout(() => {
        if (window.ArchRenderer3D) window.ArchRenderer3D.resize();
      }, 50);
    } else if (mode === 'split') {
      viewport.classList.add('split-mode');

      container2D.style.display = 'block';
      container2D.style.left = '0';
      container2D.style.width = '50%';
      container2D.style.zIndex = '5';

      container3D.style.display = 'block';
      container3D.style.left = '50%';
      container3D.style.width = '50%';
      container3D.style.zIndex = '5';

      setTimeout(() => {
        if (window.ArchRenderer2D) window.ArchRenderer2D.resize();
        if (window.ArchRenderer3D) window.ArchRenderer3D.resize();
      }, 50);
    }
  }

  // ════════ UI EVENTS BINDING ════════
  function setupUIEvents() {
    // View Switcher Buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        window.ArchState.setViewMode(mode);
        updateViewModeUI(mode);
      });
    });

    // Camera Presets
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        window.ArchState.setCameraPreset(preset);
      });
    });

    // Lighting Switcher
    const lightBtn = document.getElementById('btn-lighting');
    if (lightBtn) {
      lightBtn.addEventListener('click', () => {
        const cur = window.ArchState.getState().timeOfDay;
        const next = cur === 'day' ? 'sunset' : (cur === 'sunset' ? 'night' : 'day');
        window.ArchState.setTimeOfDay(next);
        lightBtn.innerHTML = next === 'day' ? '☀️ Día' : (next === 'sunset' ? '🌅 Atardecer' : '🌙 Noche');
      });
    }

    // Cutaway Wall Switcher
    const cutawayBtn = document.getElementById('btn-cutaway');
    if (cutawayBtn) {
      cutawayBtn.addEventListener('click', () => {
        const state = window.ArchState.getState();
        window.ArchState.setWallCutaway(!state.wallCutaway);
        cutawayBtn.classList.toggle('active', window.ArchState.getState().wallCutaway);
        showToast(window.ArchState.getState().wallCutaway ? "Corte Seccional Activado (Muros 1.10m)" : "Muros Completos (2.80m)");
      });
    }

    // Project Name Edit
    const titleInput = document.getElementById('project-title');
    if (titleInput) {
      titleInput.addEventListener('change', (e) => {
        window.ArchState.getState().meta.title = e.target.value;
      });
    }

    // Catalog Category Tabs
    document.querySelectorAll('.catalog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCatalogCategory = tab.dataset.cat;
        renderCatalog(document.getElementById('catalog-search')?.value || '');
      });
    });

    // Catalog Search Input
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderCatalog(e.target.value);
      });
    }

    // Add Floor Button
    const addFloorBtn = document.getElementById('btn-add-floor');
    if (addFloorBtn) {
      addFloorBtn.addEventListener('click', () => {
        const name = prompt("Nombre de la nueva planta (ej. Terraza Azotea):", "Nueva Planta");
        if (name) {
          window.ArchState.addFloor(name);
          showToast(`Planta agregada: ${name}`);
        }
      });
    }

    // Snap Selector in HUD
    const snapSelect = document.getElementById('hud-snap-select');
    if (snapSelect) {
      snapSelect.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        window.ArchState.setGridSnap(val === 0 ? null : val);
      });
    }

    // File Import Input
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (window.ArchState.importProjectJSON(event.target.result)) {
              showToast("Proyecto importado exitosamente desde archivo JSON");
            }
          };
          reader.readAsText(file);
        }
      });
    }
  }

  // ════════ KEYBOARD SHORTCUTS ════════
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '1') {
        window.ArchState.setViewMode('2d');
        updateViewModeUI('2d');
      } else if (e.key === '2') {
        window.ArchState.setViewMode('3d');
        updateViewModeUI('3d');
      } else if (e.key === '3') {
        window.ArchState.setViewMode('split');
        updateViewModeUI('split');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const item = window.ArchState.getSelectedItem();
        if (item) {
          window.ArchState.deleteItem(item.id);
          showToast(`Eliminado: ${item.name}`);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const item = window.ArchState.getSelectedItem();
        if (item) {
          window.ArchState.duplicateItem(item.id);
          showToast(`Duplicado: ${item.name}`);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) window.ArchState.redo();
        else window.ArchState.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        window.ArchState.saveToStorage();
      }
    });
  }

  // ════════ MODALS & EXPORTS ════════
  function openMetradoModal() {
    const modal = document.getElementById('modal-metrado');
    const tableBody = document.getElementById('metrado-rooms-body');
    const itemsBody = document.getElementById('metrado-items-body');
    const totalM2Badge = document.getElementById('metrado-total-m2');
    if (!modal) return;

    const bom = window.ArchState.getBillOfMaterials();
    totalM2Badge.textContent = `${bom.totalAreaM2} m²`;

    // Map material IDs to human-readable names
    const getMaterialName = (id) => {
      const found = window.ARCH_CONSTANTS.MATERIALS.find(m => m.id === id);
      return found ? found.name : id;
    };

    // Rooms
    tableBody.innerHTML = '';
    bom.floors.forEach(f => {
      f.rooms.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${r.name}</strong></td>
          <td>${f.name}</td>
          <td><span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 700;">${r.areaM2.toFixed(2)} m²</span></td>
          <td>${getMaterialName(r.material)}</td>
        `;
        tableBody.appendChild(tr);
      });
    });

    // Items summary
    itemsBody.innerHTML = '';
    Object.keys(bom.catalogSummary).forEach(name => {
      const it = bom.catalogSummary[name];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${name}</strong></td>
        <td><span style="font-family: var(--font-mono); font-size: 11px;">${it.dimensions}</span></td>
        <td><span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">×${it.count}</span></td>
      `;
      itemsBody.appendChild(tr);
    });

    // Default to first tab
    switchMetradoTab('areas');
    modal.classList.add('open');
  }

  function switchMetradoTab(tabName) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    const panelAreas = document.getElementById('metrado-panel-areas');
    const panelFurniture = document.getElementById('metrado-panel-furniture');
    const panelBudget = document.getElementById('metrado-panel-budget');

    if (panelAreas) panelAreas.style.display = tabName === 'areas' ? 'block' : 'none';
    if (panelFurniture) panelFurniture.style.display = tabName === 'furniture' ? 'block' : 'none';
    if (panelBudget) {
      panelBudget.style.display = tabName === 'budget' ? 'block' : 'none';
      if (tabName === 'budget') renderBudgetPanel();
    }
  }

  function renderBudgetPanel() {
    const container = document.getElementById('budget-summary-container');
    if (!container) return;

    const bom = window.ArchState.getBillOfMaterials();
    const area = bom.totalAreaM2;
    const obraGris = area * 450;
    const acabados = area * 320;
    const equipamiento = Object.keys(bom.catalogSummary).reduce((acc, k) => acc + bom.catalogSummary[k].count * 380, 0);
    const subtotal = obraGris + acabados + equipamiento;
    const contingencia = subtotal * 0.10;
    const total = subtotal + contingencia;

    container.innerHTML = `
      <table class="modal-table">
        <thead>
          <tr>
            <th>Capítulo de Obra</th>
            <th>Base de Cálculo</th>
            <th>Importe Estimado (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Estructura & Obra Gris</strong></td>
            <td>${area} m² × $450/m²</td>
            <td><span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">$${obraGris.toLocaleString('en-US', {maximumFractionDigits: 0})}</span></td>
          </tr>
          <tr>
            <td><strong>Acabados, Pisos & Revestimientos</strong></td>
            <td>${area} m² × $320/m²</td>
            <td><span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">$${acabados.toLocaleString('en-US', {maximumFractionDigits: 0})}</span></td>
          </tr>
          <tr>
            <td><strong>Mobiliario, Artefactos & Iluminación (FF&E)</strong></td>
            <td>${window.ArchState.getState().items.length} unidades instaladas</td>
            <td><span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">$${equipamiento.toLocaleString('en-US', {maximumFractionDigits: 0})}</span></td>
          </tr>
          <tr>
            <td><strong>Reserva de Contingencia (10%)</strong></td>
            <td>Imprevistos técnicos</td>
            <td><span style="font-family: var(--font-mono); font-weight: 700; color: #94a3b8;">$${contingencia.toLocaleString('en-US', {maximumFractionDigits: 0})}</span></td>
          </tr>
          <tr style="background: rgba(0, 210, 255, 0.08);">
            <td><strong style="color: var(--accent-cyan); font-size: 13px;">PRESUPUESTO TOTAL ESTIMADO</strong></td>
            <td>Llave en mano BIM</td>
            <td><span style="font-family: var(--font-mono); font-size: 15px; font-weight: 800; color: var(--accent-cyan);">$${total.toLocaleString('en-US', {maximumFractionDigits: 0})} USD</span></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  function captureScreenshot() {
    const state = window.ArchState.getState();
    let dataUrl = null;

    if (state.viewMode === '3d' && window.ArchRenderer3D) {
      dataUrl = window.ArchRenderer3D.captureHD();
    } else if (state.viewMode === '2d' && window.ArchRenderer2D) {
      dataUrl = window.ArchRenderer2D.getCanvas()?.toDataURL('image/png');
    } else {
      dataUrl = window.ArchRenderer3D?.captureHD();
    }

    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `render_${state.meta.title.toLowerCase().replace(/\s+/g, '_')}_${state.viewMode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Render HD capturado y descargado");
    }
  }

  function toggleSidebar(side) {
    const el = side === 'left' ? document.querySelector('.left-sidebar') : document.querySelector('.right-inspector');
    if (el) {
      el.classList.toggle('collapsed');
      setTimeout(() => {
        if (window.ArchRenderer2D) window.ArchRenderer2D.resize();
        if (window.ArchRenderer3D) window.ArchRenderer3D.resize();
      }, 300);
    }
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  return {
    init,
    openMetradoModal,
    switchMetradoTab,
    closeModal,
    captureScreenshot,
    toggleSidebar,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.ArchApp.init();
});
