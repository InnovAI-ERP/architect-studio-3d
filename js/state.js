/**
 * ARCHITECT STUDIO 3D - State Management & Project Store
 * Handles undo/redo, multi-floor architecture, custom JSON models,
 * polygonal rooms (Gauss Shoelace area), wall manipulation & disposition tools
 */

window.ArchState = (function() {
  const STORAGE_KEY = 'innova_architect_studio_project_v2';
  const STORAGE_CUSTOM_MODELS_KEY = 'innova_architect_custom_models';
  
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Gauss Shoelace Formula for polygon area in square meters
  function calculatePolygonArea(points) {
    if (!points || points.length < 3) return 0;
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2.0;
  }

  // Initial State from Constants
  let state = {
    meta: {
      title: "Villa Innova Contemporánea",
      author: "Innova Architectural Studio",
      created: "2026-09-25",
      unit: "m",
      scale: 1.0
    },
    floors: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.floors),
    rooms: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.rooms),
    polygonRooms: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.polygonRooms || []),
    walls: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.walls),
    items: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.items),
    
    // UI Runtime State
    activeTool: 'select', // 'select' | 'draw_wall' | 'draw_polygon'
    activeFloorId: 'floor_0',
    selectedId: null,
    selectedType: null, // 'item' | 'room' | 'polygon_room' | 'wall' | 'floor'
    viewMode: '3d', // '2d' | '3d' | 'split'
    timeOfDay: 'day', // 'day' | 'sunset' | 'night'
    wallCutaway: true,
    showCeiling: false,
    ghostFloor: true,
    gridSnap: 0.25,
    angleSnap: 15,
    
    // Camera Presets
    cameraPreset: 'orbit',
    
    // Statistics
    stats: {
      totalBuiltAreaM2: 0,
      totalRooms: 0,
      totalItems: 0
    }
  };

  // Undo / Redo Stacks
  const history = {
    past: [],
    future: [],
    max: 30
  };

  const listeners = [];

  function notify(event, payload) {
    listeners.forEach(fn => {
      try {
        fn(event, payload, state);
      } catch (e) {
        console.error("State listener error:", e);
      }
    });
  }

  function recordHistory() {
    const snapshot = JSON.stringify({
      floors: state.floors,
      rooms: state.rooms,
      polygonRooms: state.polygonRooms,
      walls: state.walls,
      items: state.items
    });
    history.past.push(snapshot);
    if (history.past.length > history.max) history.past.shift();
    history.future = [];
    recalcStats();
  }

  function recalcStats() {
    let totalM2 = 0;
    // Rectangular rooms
    state.rooms.forEach(r => {
      totalM2 += (r.width * r.depth);
    });
    // Polygonal rooms (Shoelace calculation)
    state.polygonRooms.forEach(pr => {
      totalM2 += calculatePolygonArea(pr.points);
    });

    state.stats.totalBuiltAreaM2 = parseFloat(totalM2.toFixed(2));
    state.stats.totalRooms = state.rooms.length + state.polygonRooms.length;
    state.stats.totalItems = state.items.length;
  }

  // Load / Save Custom Models in LocalStorage
  function loadCustomModels() {
    try {
      const data = localStorage.getItem(STORAGE_CUSTOM_MODELS_KEY);
      if (data) {
        const customModels = JSON.parse(data);
        if (Array.isArray(customModels)) {
          customModels.forEach(cm => {
            // Check if already in catalog
            const idx = window.ARCH_CONSTANTS.CATALOG.findIndex(c => c.id === cm.id);
            if (idx >= 0) {
              window.ARCH_CONSTANTS.CATALOG[idx] = cm;
            } else {
              window.ARCH_CONSTANTS.CATALOG.unshift(cm);
            }
          });
          return customModels;
        }
      }
    } catch (e) {
      console.warn("Could not load custom models from localStorage:", e);
    }
    return [];
  }

  function saveCustomModel(modelObj) {
    if (!modelObj || !modelObj.id || !modelObj.name) {
      throw new Error("El modelo debe incluir al menos 'id' y 'name'");
    }

    modelObj.isCustomModel = true;
    modelObj.category = modelObj.category || 'living';
    modelObj.width = parseFloat(modelObj.width) || 1.0;
    modelObj.depth = parseFloat(modelObj.depth) || 1.0;
    modelObj.height = parseFloat(modelObj.height) || 1.0;

    // Save into localStorage
    const existing = loadCustomModels();
    const idx = existing.findIndex(m => m.id === modelObj.id);
    if (idx >= 0) {
      existing[idx] = modelObj;
    } else {
      existing.unshift(modelObj);
    }
    localStorage.setItem(STORAGE_CUSTOM_MODELS_KEY, JSON.stringify(existing));

    // Update in-memory catalog
    const catIdx = window.ARCH_CONSTANTS.CATALOG.findIndex(c => c.id === modelObj.id);
    if (catIdx >= 0) {
      window.ARCH_CONSTANTS.CATALOG[catIdx] = modelObj;
    } else {
      window.ARCH_CONSTANTS.CATALOG.unshift(modelObj);
    }

    notify('catalog:customModelAdded', modelObj);
    return modelObj;
  }

  function deleteCustomModel(modelId) {
    const existing = loadCustomModels().filter(m => m.id !== modelId);
    localStorage.setItem(STORAGE_CUSTOM_MODELS_KEY, JSON.stringify(existing));

    const catIdx = window.ARCH_CONSTANTS.CATALOG.findIndex(c => c.id === modelId);
    if (catIdx >= 0) {
      window.ARCH_CONSTANTS.CATALOG.splice(catIdx, 1);
    }
    notify('catalog:customModelDeleted', modelId);
  }

  // Load / Save Project
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.floors && parsed.items) {
          state.meta = parsed.meta || state.meta;
          state.floors = parsed.floors;
          state.rooms = parsed.rooms || [];
          state.polygonRooms = parsed.polygonRooms || [];
          state.walls = parsed.walls || [];
          state.items = parsed.items;
          state.activeFloorId = state.floors[0]?.id || 'floor_0';
          recalcStats();
          notify('project:loaded');
          return true;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    recalcStats();
    return false;
  }

  function saveToStorage() {
    try {
      const data = {
        meta: state.meta,
        floors: state.floors,
        rooms: state.rooms,
        polygonRooms: state.polygonRooms,
        walls: state.walls,
        items: state.items
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notify('project:saved');
      return true;
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
      return false;
    }
  }

  function exportProjectJSON() {
    const exportData = {
      version: window.ARCH_CONSTANTS.VERSION,
      exportedAt: new Date().toISOString(),
      meta: state.meta,
      floors: state.floors,
      rooms: state.rooms,
      polygonRooms: state.polygonRooms,
      walls: state.walls,
      items: state.items
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `${state.meta.title.toLowerCase().replace(/\s+/g, '_')}_3d_project.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  function importProjectJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.floors && Array.isArray(parsed.floors)) {
        recordHistory();
        state.meta = parsed.meta || state.meta;
        state.floors = parsed.floors;
        state.rooms = parsed.rooms || [];
        state.polygonRooms = parsed.polygonRooms || [];
        state.walls = parsed.walls || [];
        state.items = parsed.items || [];
        state.activeFloorId = state.floors[0]?.id || 'floor_0';
        recalcStats();
        notify('project:imported');
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON project:", e);
      alert("Error al importar el archivo JSON del proyecto.");
    }
    return false;
  }

  // Load custom models immediately on initialization
  loadCustomModels();
  recalcStats();

  return {
    getState: () => state,
    subscribe: (fn) => listeners.push(fn),

    // Tool Management
    setActiveTool: (tool) => {
      state.activeTool = tool;
      notify('tool:changed', tool);
    },

    // Selection
    select: (id, type = 'item') => {
      state.selectedId = id;
      state.selectedType = type;
      notify('selection:changed', { id, type });
    },
    deselect: () => {
      state.selectedId = null;
      state.selectedType = null;
      notify('selection:changed', { id: null, type: null });
    },
    getSelectedItem: () => {
      if (!state.selectedId) return null;
      if (state.selectedType === 'item') {
        return state.items.find(it => it.id === state.selectedId) || null;
      }
      if (state.selectedType === 'room') {
        return state.rooms.find(r => r.id === state.selectedId) || null;
      }
      if (state.selectedType === 'polygon_room') {
        return state.polygonRooms.find(pr => pr.id === state.selectedId) || null;
      }
      if (state.selectedType === 'wall') {
        return state.walls.find(w => w.id === state.selectedId) || null;
      }
      return null;
    },

    // View Modes
    setViewMode: (mode) => {
      if (['2d', '3d', 'split'].includes(mode)) {
        state.viewMode = mode;
        notify('viewMode:changed', mode);
      }
    },
    setTimeOfDay: (time) => {
      if (['day', 'sunset', 'night'].includes(time)) {
        state.timeOfDay = time;
        notify('lighting:changed', time);
      }
    },
    setWallCutaway: (enabled) => {
      state.wallCutaway = !!enabled;
      notify('walls:cutaway', state.wallCutaway);
    },
    setShowCeiling: (enabled) => {
      state.showCeiling = !!enabled;
      notify('ceiling:visibility', state.showCeiling);
    },
    setGhostFloor: (enabled) => {
      state.ghostFloor = !!enabled;
      notify('floor:ghost', state.ghostFloor);
    },
    setGridSnap: (val) => {
      state.gridSnap = val;
      notify('snap:changed', { gridSnap: val, angleSnap: state.angleSnap });
    },
    setAngleSnap: (val) => {
      state.angleSnap = val;
      notify('snap:changed', { gridSnap: state.gridSnap, angleSnap: val });
    },
    setCameraPreset: (preset) => {
      state.cameraPreset = preset;
      notify('camera:preset', preset);
    },

    // Floor Management
    setActiveFloor: (floorId) => {
      const f = state.floors.find(fl => fl.id === floorId);
      if (f) {
        state.activeFloorId = floorId;
        notify('floor:activated', floorId);
      }
    },
    getActiveFloor: () => {
      return state.floors.find(fl => fl.id === state.activeFloorId) || state.floors[0];
    },
    toggleFloorVisibility: (floorId) => {
      const f = state.floors.find(fl => fl.id === floorId);
      if (f) {
        f.visible = !f.visible;
        notify('floor:visibility', { floorId, visible: f.visible });
      }
    },
    addFloor: (name, height = 2.80) => {
      recordHistory();
      const nextElev = state.floors.reduce((max, f) => Math.max(max, f.elevation + f.height), 0);
      const newFloor = {
        id: 'floor_' + Date.now(),
        name: name || `Planta Nivel +${nextElev.toFixed(2)}m`,
        elevation: nextElev,
        height: height,
        visible: true,
        wallColor: '#F8F9FA',
        floorMaterial: 'wood_oak',
        order: state.floors.length
      };
      state.floors.push(newFloor);
      state.activeFloorId = newFloor.id;
      notify('floor:added', newFloor);
      return newFloor;
    },
    updateFloor: (floorId, updates) => {
      const f = state.floors.find(fl => fl.id === floorId);
      if (f) {
        recordHistory();
        Object.assign(f, updates);
        notify('floor:updated', f);
      }
    },

    // Item Operations & Advanced Manipulations
    addItem: (catalogId, x = 4.0, y = 4.0, customProps = {}) => {
      recordHistory();
      const cat = window.ARCH_CONSTANTS.CATALOG.find(c => c.id === catalogId);
      if (!cat) return null;

      const newItem = {
        id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        catalogId: cat.id,
        floorId: state.activeFloorId,
        name: cat.name,
        x: x,
        y: y,
        z: cat.elevation || 0.0,
        width: cat.width,
        depth: cat.depth,
        height: cat.height,
        rotation: 0,
        flipX: false,
        flipY: false,
        color: cat.color,
        material: cat.material || 'wood_oak',
        components: cat.components ? deepClone(cat.components) : null,
        isCustomModel: !!cat.isCustomModel,
        locked: false,
        ...customProps
      };

      state.items.push(newItem);
      state.selectedId = newItem.id;
      state.selectedType = 'item';
      recalcStats();
      notify('item:added', newItem);
      return newItem;
    },

    updateItem: (itemId, updates, pushHistory = true) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) {
        if (pushHistory) recordHistory();
        Object.assign(item, updates);
        notify('item:updated', item);
      }
    },

    // Disposición: Girar 90°, 180°, Voltear Espejo Horizontal y Vertical
    rotateItem90: (itemId, dir = 1) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) {
        recordHistory();
        let rot = (item.rotation || 0) + (dir * 90);
        rot = (rot % 360 + 360) % 360;
        item.rotation = rot;
        notify('item:updated', item);
      }
    },

    rotateItem180: (itemId) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) {
        recordHistory();
        let rot = ((item.rotation || 0) + 180) % 360;
        item.rotation = rot;
        notify('item:updated', item);
      }
    },

    flipItemHorizontal: (itemId) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) {
        recordHistory();
        item.flipX = !item.flipX;
        notify('item:updated', item);
      }
    },

    flipItemVertical: (itemId) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) {
        recordHistory();
        item.flipY = !item.flipY;
        notify('item:updated', item);
      }
    },

    duplicateItem: (itemId) => {
      const orig = state.items.find(it => it.id === itemId);
      if (!orig) return null;
      recordHistory();
      const cloned = deepClone(orig);
      cloned.id = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      cloned.x += 0.5;
      cloned.y += 0.5;
      cloned.name = orig.name + ' (Copia)';
      state.items.push(cloned);
      state.selectedId = cloned.id;
      state.selectedType = 'item';
      recalcStats();
      notify('item:added', cloned);
      return cloned;
    },

    deleteItem: (itemId) => {
      const idx = state.items.findIndex(it => it.id === itemId);
      if (idx !== -1) {
        recordHistory();
        const deleted = state.items.splice(idx, 1)[0];
        if (state.selectedId === itemId) {
          state.selectedId = null;
          state.selectedType = null;
        }
        recalcStats();
        notify('item:deleted', deleted);
      }
    },

    // Wall Operations (Drawing, Stretching, Extension, Deletion)
    addWall: (wall) => {
      recordHistory();
      const newWall = {
        id: 'wall_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        floorId: state.activeFloorId,
        x1: parseFloat(wall.x1.toFixed(2)),
        y1: parseFloat(wall.y1.toFixed(2)),
        x2: parseFloat(wall.x2.toFixed(2)),
        y2: parseFloat(wall.y2.toFixed(2)),
        thickness: wall.thickness || window.ARCH_CONSTANTS.DEFAULT_WALL_THICKNESS,
        height: wall.height || window.ARCH_CONSTANTS.DEFAULT_WALL_HEIGHT,
        color: wall.color || '#EDE8DF'
      };
      state.walls.push(newWall);
      state.selectedId = newWall.id;
      state.selectedType = 'wall';
      notify('wall:added', newWall);
      return newWall;
    },

    updateWall: (wallId, updates, pushHistory = true) => {
      const wall = state.walls.find(w => w.id === wallId);
      if (wall) {
        if (pushHistory) recordHistory();
        Object.assign(wall, updates);
        notify('wall:updated', wall);
      }
    },

    deleteWall: (wallId) => {
      const idx = state.walls.findIndex(w => w.id === wallId);
      if (idx !== -1) {
        recordHistory();
        const deleted = state.walls.splice(idx, 1)[0];
        if (state.selectedId === wallId) {
          state.selectedId = null;
          state.selectedType = null;
        }
        notify('wall:deleted', deleted);
      }
    },

    // Rectangular Room Operations
    updateRoom: (roomId, updates) => {
      const r = state.rooms.find(rm => rm.id === roomId);
      if (r) {
        recordHistory();
        Object.assign(r, updates);
        recalcStats();
        notify('room:updated', r);
      }
    },

    // Polygonal Rooms (Ambientes y Áreas Libres No Rectangulares)
    addPolygonRoom: (polyData) => {
      recordHistory();
      const area = calculatePolygonArea(polyData.points);
      const newPoly = {
        id: 'poly_' + Date.now(),
        floorId: state.activeFloorId,
        name: polyData.name || `Área Poligonal ${state.polygonRooms.length + 1}`,
        points: deepClone(polyData.points),
        floorMaterial: polyData.floorMaterial || 'grass_emerald',
        wallColor: polyData.wallColor || '#7E8F7C',
        isGarden: polyData.floorMaterial === 'grass_emerald'
      };
      state.polygonRooms.push(newPoly);
      state.selectedId = newPoly.id;
      state.selectedType = 'polygon_room';
      recalcStats();
      notify('polygon:added', newPoly);
      return newPoly;
    },

    updatePolygonRoom: (polyId, updates, pushHistory = true) => {
      const poly = state.polygonRooms.find(pr => pr.id === polyId);
      if (poly) {
        if (pushHistory) recordHistory();
        Object.assign(poly, updates);
        recalcStats();
        notify('polygon:updated', poly);
      }
    },

    deletePolygonRoom: (polyId) => {
      const idx = state.polygonRooms.findIndex(pr => pr.id === polyId);
      if (idx !== -1) {
        recordHistory();
        const deleted = state.polygonRooms.splice(idx, 1)[0];
        if (state.selectedId === polyId) {
          state.selectedId = null;
          state.selectedType = null;
        }
        recalcStats();
        notify('polygon:deleted', deleted);
      }
    },

    calculatePolygonArea,

    // Movement Helpers for UI & Inspector
    moveRoom: (roomId, dx, dy) => {
      const r = state.rooms.find(rm => rm.id === roomId);
      if (r) {
        recordHistory();
        r.x = parseFloat((r.x + dx).toFixed(2));
        r.y = parseFloat((r.y + dy).toFixed(2));
        notify('room:updated', r);
      }
    },

    moveWall: (wallId, dx, dy) => {
      const w = state.walls.find(wl => wl.id === wallId);
      if (w) {
        recordHistory();
        w.x1 = parseFloat((w.x1 + dx).toFixed(2));
        w.y1 = parseFloat((w.y1 + dy).toFixed(2));
        w.x2 = parseFloat((w.x2 + dx).toFixed(2));
        w.y2 = parseFloat((w.y2 + dy).toFixed(2));
        notify('wall:updated', w);
      }
    },

    movePolygonRoom: (polyId, dx, dy) => {
      const poly = state.polygonRooms.find(pr => pr.id === polyId);
      if (poly) {
        recordHistory();
        poly.points.forEach(p => {
          p.x = parseFloat((p.x + dx).toFixed(2));
          p.y = parseFloat((p.y + dy).toFixed(2));
        });
        notify('polygon:updated', poly);
      }
    },

    // Download Single Selected Model JSON
    downloadSelectedModelJSON: () => {
      const item = state.items.find(it => it.id === state.selectedId);
      if (!item) {
        alert("Selecciona primero un elemento o mueble en el canvas para descargar su JSON.");
        return;
      }
      const modelExport = {
        id: item.catalogId || item.id,
        name: item.name,
        category: "custom",
        width: item.width,
        depth: item.depth,
        height: item.height,
        color: item.color,
        material: item.material,
        rotation: item.rotation || 0,
        flipX: !!item.flipX,
        flipY: !!item.flipY,
        components: item.components || [
          { type: "box", w: item.width, d: item.depth, h: item.height, x: 0, y: item.height / 2, z: 0, color: item.color }
        ]
      };
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(modelExport, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", jsonStr);
      dlAnchor.setAttribute("download", `modelo_${item.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      window.ArchApp.showToast(`Modelo "${item.name}" descargado en JSON`);
    },

    // Custom Models API
    loadCustomModels,
    saveCustomModel,
    deleteCustomModel,

    // Undo / Redo
    undo: () => {
      if (history.past.length === 0) return;
      const current = JSON.stringify({
        floors: state.floors,
        rooms: state.rooms,
        polygonRooms: state.polygonRooms,
        walls: state.walls,
        items: state.items
      });
      history.future.push(current);
      const prev = JSON.parse(history.past.pop());
      state.floors = prev.floors;
      state.rooms = prev.rooms;
      state.polygonRooms = prev.polygonRooms || [];
      state.walls = prev.walls;
      state.items = prev.items;
      recalcStats();
      notify('history:undo');
    },

    redo: () => {
      if (history.future.length === 0) return;
      const current = JSON.stringify({
        floors: state.floors,
        rooms: state.rooms,
        polygonRooms: state.polygonRooms,
        walls: state.walls,
        items: state.items
      });
      history.past.push(current);
      const next = JSON.parse(history.future.pop());
      state.floors = next.floors;
      state.rooms = next.rooms;
      state.polygonRooms = next.polygonRooms || [];
      state.walls = next.walls;
      state.items = next.items;
      recalcStats();
      notify('history:redo');
    },

    // Bill of Materials / Metrado Summary
    getBillOfMaterials: () => {
      const bom = {
        totalAreaM2: state.stats.totalBuiltAreaM2,
        floors: state.floors.map(f => {
          const floorRooms = state.rooms.filter(r => r.floorId === f.id);
          const floorPolyRooms = state.polygonRooms.filter(pr => pr.floorId === f.id);
          const floorItems = state.items.filter(it => it.floorId === f.id);

          const rArea = floorRooms.reduce((acc, r) => acc + (r.width * r.depth), 0);
          const pArea = floorPolyRooms.reduce((acc, pr) => acc + calculatePolygonArea(pr.points), 0);

          const allRooms = [
            ...floorRooms.map(r => ({
              name: r.name,
              areaM2: parseFloat((r.width * r.depth).toFixed(2)),
              material: r.floorMaterial
            })),
            ...floorPolyRooms.map(pr => ({
              name: pr.name,
              areaM2: parseFloat(calculatePolygonArea(pr.points).toFixed(2)),
              material: pr.floorMaterial
            }))
          ];

          return {
            name: f.name,
            elevation: f.elevation,
            areaM2: parseFloat((rArea + pArea).toFixed(2)),
            rooms: allRooms,
            itemCount: floorItems.length
          };
        }),
        catalogSummary: {}
      };

      state.items.forEach(it => {
        if (!bom.catalogSummary[it.name]) {
          bom.catalogSummary[it.name] = {
            count: 0,
            dimensions: `${it.width.toFixed(2)}m × ${it.depth.toFixed(2)}m`,
            category: it.catalogId
          };
        }
        bom.catalogSummary[it.name].count++;
      });

      return bom;
    },

    saveToStorage,
    loadFromStorage,
    exportProjectJSON,
    importProjectJSON,
    resetToDemo: () => {
      recordHistory();
      state.floors = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.floors);
      state.rooms = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.rooms);
      state.polygonRooms = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.polygonRooms || []);
      state.walls = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.walls);
      state.items = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.items);
      state.activeFloorId = 'floor_0';
      recalcStats();
      notify('project:reset');
    }
  };
})();
