/**
 * ARCHITECT STUDIO 3D - State Management & Project Store
 * Handles undo/redo, multi-floor architecture, metrado/calculations, import/export
 */

window.ArchState = (function() {
  const STORAGE_KEY = 'innova_architect_studio_project_v2';
  
  // Clone helper
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
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
    walls: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.walls),
    items: deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.items),
    
    // UI Runtime State
    activeFloorId: 'floor_0',
    selectedId: null,
    selectedType: null, // 'item' | 'room' | 'wall' | 'floor'
    viewMode: '3d', // '2d' | '3d' | 'split'
    timeOfDay: 'day', // 'day' | 'sunset' | 'night'
    wallCutaway: true, // Cutaway 1.1m walls for interior visibility in 3D
    showCeiling: false,
    ghostFloor: true, // Show lower floor transparently when in upper floor
    gridSnap: 0.25,
    angleSnap: 15,
    
    // Camera Presets
    cameraPreset: 'orbit', // 'orbit' | 'iso' | 'top' | 'fpv'
    
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

  // Event Listeners
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
      walls: state.walls,
      items: state.items
    });
    history.past.push(snapshot);
    if (history.past.length > history.max) history.past.shift();
    history.future = []; // Clear redo
    recalcStats();
  }

  function recalcStats() {
    let totalM2 = 0;
    state.rooms.forEach(r => {
      totalM2 += (r.width * r.depth);
    });
    state.stats.totalBuiltAreaM2 = parseFloat(totalM2.toFixed(2));
    state.stats.totalRooms = state.rooms.length;
    state.stats.totalItems = state.items.length;
  }

  // Load from local storage if exists
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.floors && parsed.items) {
          state.meta = parsed.meta || state.meta;
          state.floors = parsed.floors;
          state.rooms = parsed.rooms || [];
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

  // Export JSON file
  function exportProjectJSON() {
    const exportData = {
      version: window.ARCH_CONSTANTS.VERSION,
      exportedAt: new Date().toISOString(),
      meta: state.meta,
      floors: state.floors,
      rooms: state.rooms,
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

  // Import JSON file
  function importProjectJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.floors && Array.isArray(parsed.floors)) {
        recordHistory();
        state.meta = parsed.meta || state.meta;
        state.floors = parsed.floors;
        state.rooms = parsed.rooms || [];
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

  // Initial Calculation
  recalcStats();

  return {
    getState: () => state,
    subscribe: (fn) => listeners.push(fn),

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

    // Item Operations
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
        color: cat.color,
        material: cat.material || 'wood_oak',
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

    // Room Operations
    updateRoom: (roomId, updates) => {
      const r = state.rooms.find(rm => rm.id === roomId);
      if (r) {
        recordHistory();
        Object.assign(r, updates);
        recalcStats();
        notify('room:updated', r);
      }
    },

    // Wall Operations
    addWall: (wall) => {
      recordHistory();
      const newWall = {
        id: 'wall_' + Date.now(),
        floorId: state.activeFloorId,
        x1: wall.x1,
        y1: wall.y1,
        x2: wall.x2,
        y2: wall.y2,
        thickness: wall.thickness || window.ARCH_CONSTANTS.DEFAULT_WALL_THICKNESS,
        height: wall.height || window.ARCH_CONSTANTS.DEFAULT_WALL_HEIGHT,
        color: wall.color || '#EDE8DF'
      };
      state.walls.push(newWall);
      notify('wall:added', newWall);
      return newWall;
    },

    // Undo / Redo
    undo: () => {
      if (history.past.length === 0) return;
      const current = JSON.stringify({
        floors: state.floors,
        rooms: state.rooms,
        walls: state.walls,
        items: state.items
      });
      history.future.push(current);
      const prev = JSON.parse(history.past.pop());
      state.floors = prev.floors;
      state.rooms = prev.rooms;
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
        walls: state.walls,
        items: state.items
      });
      history.past.push(current);
      const next = JSON.parse(history.future.pop());
      state.floors = next.floors;
      state.rooms = next.rooms;
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
          const floorArea = floorRooms.reduce((acc, r) => acc + (r.width * r.depth), 0);
          const floorItems = state.items.filter(it => it.floorId === f.id);
          return {
            name: f.name,
            elevation: f.elevation,
            areaM2: parseFloat(floorArea.toFixed(2)),
            rooms: floorRooms.map(r => ({
              name: r.name,
              areaM2: parseFloat((r.width * r.depth).toFixed(2)),
              material: r.floorMaterial
            })),
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

    // Persistence API
    saveToStorage,
    loadFromStorage,
    exportProjectJSON,
    importProjectJSON,
    resetToDemo: () => {
      recordHistory();
      state.floors = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.floors);
      state.rooms = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.rooms);
      state.walls = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.walls);
      state.items = deepClone(window.ARCH_CONSTANTS.DEFAULT_PROJECT.items);
      state.activeFloorId = 'floor_0';
      recalcStats();
      notify('project:reset');
    }
  };
})();
