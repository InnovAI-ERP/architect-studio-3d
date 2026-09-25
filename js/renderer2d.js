/**
 * ARCHITECT STUDIO 3D - 2D CAD Blueprint Engine
 * Ultra-crisp architectural drafting with metric grid, dimension lines, CAD symbols & manipulators
 */

window.ArchRenderer2D = (function() {
  let canvas, ctx;
  let container;
  let width = 0, height = 0;
  
  // Transform State (Pan & Zoom)
  let zoom = 55; // Pixels per meter
  let panX = 180; // Pixel offset X
  let panY = 120; // Pixel offset Y
  
  // Interaction State
  let isDragging = false;
  let isPanning = false;
  let isRotating = false;
  let dragStartX = 0, dragStartY = 0;
  let initialItemX = 0, initialItemY = 0;
  let initialRotation = 0;
  let hoveredItemId = null;
  let onHoverCoordsCallback = null;

  // Initialize Canvas
  function init(canvasElement, containerElement) {
    canvas = canvasElement;
    container = containerElement;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);
    setupEvents();
    render();
  }

  function resize() {
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    render();
  }

  // Coordinate Conversion
  function worldToScreen(wx, wy) {
    return {
      x: panX + wx * zoom,
      y: panY + wy * zoom
    };
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - panX) / zoom,
      y: (sy - panY) / zoom
    };
  }

  function snapValue(val, step) {
    if (!step) return val;
    return Math.round(val / step) * step;
  }

  // Main Render Loop
  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const state = window.ArchState.getState();
    const activeFloorId = state.activeFloorId;
    const activeFloor = state.floors.find(f => f.id === activeFloorId);

    // 1. Technical Architectural Grid
    drawGrid(state);

    // 2. Ghost Floor (Planta Inferior / Superior en semitransparente si está activado)
    if (state.ghostFloor && state.floors.length > 1) {
      drawGhostFloors(state, activeFloorId);
    }

    // 3. Rooms & Zones (Suelos, cotas de área)
    drawRooms(state, activeFloorId);

    // 4. Architectural Walls & Openings
    drawWalls(state, activeFloorId);

    // 5. Furniture & Utensils CAD Symbols
    drawItems(state, activeFloorId);

    // 6. Active Selection Bounding Box & Gizmo
    drawSelectionGizmo(state);

    // 7. Architectural Scale Bar (HUD)
    drawScaleBar();
  }

  // 1. Grid Drawing
  function drawGrid(state) {
    ctx.save();
    const snap = state.gridSnap || 0.25;

    // Minor Grid (0.25m / 0.5m)
    const minorStep = 0.5 * zoom;
    ctx.strokeStyle = '#1a2233';
    ctx.lineWidth = 0.5;

    const startX = (panX % minorStep);
    for (let x = startX; x < width; x += minorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    const startY = (panY % minorStep);
    for (let y = startY; y < height; y += minorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Major Grid (1.0m)
    const majorStep = 1.0 * zoom;
    ctx.strokeStyle = '#27344d';
    ctx.lineWidth = 1;

    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';

    const mStartX = (panX % majorStep);
    for (let x = mStartX; x < width; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Coordinate meter label
      const worldMeterX = Math.round((x - panX) / zoom);
      if (worldMeterX % 2 === 0) {
        ctx.fillText(`${worldMeterX}m`, x + 3, 14);
      }
    }

    const mStartY = (panY % majorStep);
    for (let y = mStartY; y < height; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const worldMeterY = Math.round((y - panY) / zoom);
      if (worldMeterY % 2 === 0) {
        ctx.fillText(`${worldMeterY}m`, 4, y - 4);
      }
    }

    // World Origin (0,0) Marker
    const origin = worldToScreen(0, 0);
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x - 15, origin.y);
    ctx.lineTo(origin.x + 15, origin.y);
    ctx.moveTo(origin.x, origin.y - 15);
    ctx.lineTo(origin.x, origin.y + 15);
    ctx.stroke();

    ctx.fillStyle = '#00d2ff';
    ctx.fillText('(0.0, 0.0) ORIGEN CAD', origin.x + 6, origin.y + 14);

    ctx.restore();
  }

  // 2. Ghost Floors
  function drawGhostFloors(state, activeFloorId) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.setLineDash([4, 4]);

    state.floors.forEach(f => {
      if (f.id === activeFloorId || !f.visible) return;
      // Draw ghost walls
      state.walls.filter(w => w.floorId === f.id).forEach(w => {
        const p1 = worldToScreen(w.x1, w.y1);
        const p2 = worldToScreen(w.x2, w.y2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = (w.thickness || 0.18) * zoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
    });

    ctx.restore();
  }

  // 3. Rooms & Zones
  function drawRooms(state, activeFloorId) {
    const rooms = state.rooms.filter(r => r.floorId === activeFloorId);

    rooms.forEach(room => {
      const p = worldToScreen(room.x, room.y);
      const rw = room.width * zoom;
      const rh = room.depth * zoom;

      ctx.save();

      // Subtle floor tint
      let roomFill = 'rgba(255, 255, 255, 0.03)';
      if (room.floorMaterial === 'wood_oak') roomFill = 'rgba(196, 154, 108, 0.08)';
      else if (room.floorMaterial === 'marble_carrara') roomFill = 'rgba(240, 240, 242, 0.08)';
      else if (room.floorMaterial === 'deck_teak') roomFill = 'rgba(160, 106, 59, 0.09)';
      else if (room.floorMaterial === 'tile_slate') roomFill = 'rgba(50, 55, 62, 0.25)';

      ctx.fillStyle = roomFill;
      ctx.fillRect(p.x, p.y, rw, rh);

      // Room border line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, p.y, rw, rh);

      // Dimension Lines (Cotas Arquitectónicas)
      drawDimensionLine(p.x, p.y - 12, p.x + rw, p.y - 12, `${room.width.toFixed(2)} m`);
      drawDimensionLine(p.x - 12, p.y, p.x - 12, p.y + rh, `${room.depth.toFixed(2)} m`, true);

      // Central Room Badge
      const areaM2 = (room.width * room.depth).toFixed(2);
      const cx = p.x + rw / 2;
      const cy = p.y + rh / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 150;
      const badgeH = 34;
      roundRect(ctx, cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, cx, cy - 3);

      ctx.fillStyle = '#00d2ff';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`ÁREA: ${areaM2} m²`, cx, cy + 10);

      ctx.restore();
    });
  }

  // Dimension Line Helper
  function drawDimensionLine(x1, y1, x2, y2, text, vertical = false) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // End ticks (45-degree architectural slashes)
    const tick = 4;
    ctx.beginPath();
    ctx.moveTo(x1 - tick, y1 - tick);
    ctx.lineTo(x1 + tick, y1 + tick);
    ctx.moveTo(x2 - tick, y2 - tick);
    ctx.lineTo(x2 + tick, y2 + tick);
    ctx.stroke();

    // Measurement Text
    ctx.fillStyle = '#bae6fd';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    if (vertical) {
      ctx.save();
      ctx.translate(midX - 10, midY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(text, midX, midY - 6);
    }

    ctx.restore();
  }

  // 4. Architectural Walls
  function drawWalls(state, activeFloorId) {
    const walls = state.walls.filter(w => w.floorId === activeFloorId);

    ctx.save();
    walls.forEach(w => {
      const p1 = worldToScreen(w.x1, w.y1);
      const p2 = worldToScreen(w.x2, w.y2);
      const thick = (w.thickness || 0.18) * zoom;

      // Solid Wall Core (Graphite CAD style)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = thick;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Outer Edge Lines
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 5. Furniture & Utensils CAD Symbols
  function drawItems(state, activeFloorId) {
    const items = state.items.filter(it => it.floorId === activeFloorId);

    items.forEach(item => {
      ctx.save();
      const pos = worldToScreen(item.x, item.y);
      const iw = item.width * zoom;
      const id = item.depth * zoom;

      ctx.translate(pos.x, pos.y);
      ctx.rotate((item.rotation || 0) * (Math.PI / 180));

      const isSelected = (state.selectedId === item.id);
      const isHovered = (hoveredItemId === item.id);

      // Base body fill
      ctx.fillStyle = isSelected ? 'rgba(0, 210, 255, 0.18)' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 41, 59, 0.85)');
      ctx.strokeStyle = isSelected ? '#00d2ff' : (isHovered ? '#f8fafc' : '#64748b');
      ctx.lineWidth = isSelected ? 2 : 1.2;

      // Draw specific CAD Symbol
      drawCadSymbol(item, -iw / 2, -id / 2, iw, id);

      // Label text
      ctx.fillStyle = isSelected ? '#00d2ff' : '#cbd5e1';
      ctx.font = '8.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.split(' ')[0], 0, id / 2 + 12);

      ctx.restore();
    });
  }

  // Specific 2D CAD Symbols for Items
  function drawCadSymbol(item, x, y, w, h) {
    const cid = item.catalogId;

    if (cid.startsWith('stair')) {
      // 🪜 ESCALERA CAD CON PELDAÑOS Y FLECHA "SUBE"
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      // 16 Tread lines
      const steps = 14;
      const stepH = h / steps;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let i = 1; i < steps; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * stepH);
        ctx.lineTo(x + w, y + i * stepH);
        ctx.stroke();
      }

      // Walkline & Direction Arrow "SUBE"
      ctx.strokeStyle = '#00d2ff';
      ctx.fillStyle = '#00d2ff';
      ctx.lineWidth = 1.8;
      // Start circle
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      // Arrow line
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h - 10);
      ctx.lineTo(x + w / 2, y + 10);
      ctx.stroke();
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 5, y + 16);
      ctx.lineTo(x + w / 2, y + 8);
      ctx.lineTo(x + w / 2 + 5, y + 16);
      ctx.stroke();

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SUBE', x + w / 2, y + h / 2);

    } else if (cid.startsWith('sofa')) {
      // 🛋️ SOFÁ CON COJINES
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      // Backrest
      ctx.strokeRect(x, y, w, h * 0.25);
      // Cushions divider
      if (w > h) {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h * 0.25);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();
      }
      // Armrests
      ctx.strokeRect(x, y, w * 0.15, h);
      ctx.strokeRect(x + w * 0.85, y, w * 0.15, h);

    } else if (cid.startsWith('bed')) {
      // 🛏️ CAMA CON ALMOHADAS Y EDREDÓN
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      // Headboard
      ctx.strokeRect(x, y, w, h * 0.12);
      // Pillows
      const pW = w * 0.38;
      const pH = h * 0.18;
      ctx.strokeRect(x + w * 0.08, y + h * 0.16, pW, pH);
      ctx.strokeRect(x + w * 0.54, y + h * 0.16, pW, pH);
      // Folded duvet line
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.45);
      ctx.lineTo(x + w, y + h * 0.45);
      ctx.stroke();

    } else if (cid.startsWith('kitchen_island')) {
      // 🍳 ISLA DE COCINA CON FREGADERO Y TABURETES
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      // Sink bowls
      ctx.strokeRect(x + w * 0.15, y + h * 0.2, w * 0.3, h * 0.6);
      ctx.strokeRect(x + w * 0.28, y + h * 0.2, w * 0.15, h * 0.6);
      // Faucet dot
      ctx.beginPath();
      ctx.arc(x + w * 0.29, y + h * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (cid.startsWith('dining_table')) {
      // 🍽️ MESA DE COMEDOR CON SILLAS ALREDEDOR
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      // Chairs
      const chairW = w * 0.22;
      const chairH = h * 0.25;
      for (let i = 0; i < 3; i++) {
        // Top chairs
        ctx.strokeRect(x + w * 0.1 + i * w * 0.3, y - chairH * 0.8, chairW, chairH);
        // Bottom chairs
        ctx.strokeRect(x + w * 0.1 + i * w * 0.3, y + h - chairH * 0.2, chairW, chairH);
      }

    } else if (cid.startsWith('door')) {
      // 🚪 PUERTA CON ARCO DE APERTURA CAD (90 grados)
      ctx.strokeRect(x, y - 2, w, 4);
      // Door swing trajectory
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([3, 3]);
      ctx.arc(x, y, w, 0, Math.PI / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Door leaf
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + w);
      ctx.stroke();

    } else if (cid.startsWith('window')) {
      // 🪟 VENTANA DOBLE CRISTAL
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();

    } else if (cid.startsWith('bathtub')) {
      // 🛁 TINA OVALADA
      roundRect(ctx, x, y, w, h, Math.min(w, h) / 2);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, x + 4, y + 4, w - 8, h - 8, Math.min(w, h) / 2 - 4);
      ctx.stroke();

    } else if (cid.startsWith('vanity')) {
      // 🪞 TOCADOR CON LAVABOS
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, Math.PI * 2);
      ctx.stroke();

    } else if (cid.startsWith('plant')) {
      // 🌿 PLANTA
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Leaf spokes
      for (let a = 0; a < 6; a++) {
        const ang = a * (Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h / 2);
        ctx.lineTo(x + w / 2 + Math.cos(ang) * (w / 2), y + h / 2 + Math.sin(ang) * (h / 2));
        ctx.stroke();
      }

    } else {
      // Símbolo genérico
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    }
  }

  // 6. Selection Bounding Box & Interactive Handles
  function drawSelectionGizmo(state) {
    if (!state.selectedId || state.selectedType !== 'item') return;
    const item = state.items.find(it => it.id === state.selectedId);
    if (!item || item.floorId !== state.activeFloorId) return;

    ctx.save();
    const pos = worldToScreen(item.x, item.y);
    const iw = item.width * zoom;
    const id = item.depth * zoom;

    ctx.translate(pos.x, pos.y);
    ctx.rotate((item.rotation || 0) * (Math.PI / 180));

    // Outer Selection Halo
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-iw / 2 - 6, -id / 2 - 6, iw + 12, id + 12);
    ctx.setLineDash([]);

    // Corner Handles
    const handleSize = 7;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;

    const corners = [
      [-iw / 2 - 6, -id / 2 - 6],
      [iw / 2 + 6, -id / 2 - 6],
      [iw / 2 + 6, id / 2 + 6],
      [-iw / 2 - 6, id / 2 + 6]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    });

    // Rotation Handle (Circle above top edge)
    const rotDist = id / 2 + 25;
    ctx.beginPath();
    ctx.moveTo(0, -id / 2 - 6);
    ctx.lineTo(0, -rotDist);
    ctx.stroke();

    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.arc(0, -rotDist, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Measurement Tooltip
    ctx.fillStyle = 'rgba(0, 210, 255, 0.9)';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.width.toFixed(2)}m × ${item.depth.toFixed(2)}m (${item.rotation || 0}°)`, 0, -rotDist - 10);

    ctx.restore();
  }

  // 7. Scale Bar
  function drawScaleBar() {
    ctx.save();
    const barX = 25;
    const barY = height - 25;
    const meterPx = zoom; // 1 meter in pixels

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + meterPx * 2, barY);
    ctx.stroke();

    // Ticks
    ctx.beginPath();
    ctx.moveTo(barX, barY - 4);
    ctx.lineTo(barX, barY + 4);
    ctx.moveTo(barX + meterPx, barY - 4);
    ctx.lineTo(barX + meterPx, barY + 4);
    ctx.moveTo(barX + meterPx * 2, barY - 4);
    ctx.lineTo(barX + meterPx * 2, barY + 4);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', barX, barY - 8);
    ctx.fillText('1.0m', barX + meterPx, barY - 8);
    ctx.fillText('2.0m (ESCALA)', barX + meterPx * 2, barY - 8);

    ctx.restore();
  }

  // Rounded rectangle helper
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Events & Interaction
  function setupEvents() {
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  function getMouseWorld(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return {
      screenX: sx,
      screenY: sy,
      ...screenToWorld(sx, sy)
    };
  }

  function findItemAt(wx, wy, state) {
    const activeFloorId = state.activeFloorId;
    const items = state.items.filter(it => it.floorId === activeFloorId);

    // Search in reverse so top-most item is picked first
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const rad = ((it.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      const dx = wx - it.x;
      const dy = wy - it.y;
      const localX = cos * dx - sin * dy;
      const localY = sin * dx + cos * dy;

      if (Math.abs(localX) <= it.width / 2 && Math.abs(localY) <= it.depth / 2) {
        return it;
      }
    }
    return null;
  }

  function onMouseDown(e) {
    const m = getMouseWorld(e);
    const state = window.ArchState.getState();

    // Middle click or Space/Alt click -> Pan
    if (e.button === 1 || e.button === 2 || e.spaceKey || e.altKey) {
      isPanning = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      return;
    }

    // Left click
    if (e.button === 0) {
      // Check if clicking rotation handle of selected item
      if (state.selectedId && state.selectedType === 'item') {
        const item = state.items.find(it => it.id === state.selectedId);
        if (item) {
          const rotDist = item.depth / 2 + 25 / zoom;
          const rad = ((item.rotation || 0) * Math.PI) / 180;
          // Rotation knob world position
          const hx = item.x + Math.sin(rad) * rotDist;
          const hy = item.y - Math.cos(rad) * rotDist;
          const dist = Math.hypot(m.x - hx, m.y - hy);

          if (dist <= 15 / zoom) {
            isRotating = true;
            dragStartX = m.x;
            dragStartY = m.y;
            initialRotation = item.rotation || 0;
            return;
          }
        }
      }

      // Check item hit
      const hit = findItemAt(m.x, m.y, state);
      if (hit) {
        window.ArchState.select(hit.id, 'item');
        isDragging = true;
        dragStartX = m.x;
        dragStartY = m.y;
        initialItemX = hit.x;
        initialItemY = hit.y;
      } else {
        window.ArchState.deselect();
        // Start dragging to pan
        isPanning = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    }
    render();
  }

  function onMouseMove(e) {
    const m = getMouseWorld(e);
    const state = window.ArchState.getState();

    if (onHoverCoordsCallback) {
      onHoverCoordsCallback(m.x, m.y);
    }

    if (isPanning) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      panX += dx;
      panY += dy;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      render();
      return;
    }

    if (isDragging && state.selectedId) {
      const item = state.items.find(it => it.id === state.selectedId);
      if (item && !item.locked) {
        let newX = initialItemX + (m.x - dragStartX);
        let newY = initialItemY + (m.y - dragStartY);
        if (state.gridSnap) {
          newX = snapValue(newX, state.gridSnap);
          newY = snapValue(newY, state.gridSnap);
        }
        item.x = parseFloat(newX.toFixed(2));
        item.y = parseFloat(newY.toFixed(2));
        window.ArchState.updateItem(item.id, { x: item.x, y: item.y }, false);
        render();
      }
      return;
    }

    if (isRotating && state.selectedId) {
      const item = state.items.find(it => it.id === state.selectedId);
      if (item) {
        const angle = Math.atan2(m.y - item.y, m.x - item.x);
        let deg = Math.round((angle * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (state.angleSnap) {
          deg = Math.round(deg / state.angleSnap) * state.angleSnap;
        }
        item.rotation = deg % 360;
        window.ArchState.updateItem(item.id, { rotation: item.rotation }, false);
        render();
      }
      return;
    }

    // Hover check
    const hit = findItemAt(m.x, m.y, state);
    if (hit?.id !== hoveredItemId) {
      hoveredItemId = hit ? hit.id : null;
      canvas.style.cursor = hit ? 'move' : 'crosshair';
      render();
    }
  }

  function onMouseUp() {
    isDragging = false;
    isPanning = false;
    isRotating = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.max(15, Math.min(220, zoom * zoomFactor));

    // Zoom centered on mouse pointer
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;

    render();
  }

  // Public Interface
  return {
    init,
    resize,
    render,
    resetView: () => {
      zoom = 55;
      panX = width / 2 - 300;
      panY = height / 2 - 200;
      render();
    },
    zoomIn: () => {
      zoom = Math.min(220, zoom * 1.2);
      render();
    },
    zoomOut: () => {
      zoom = Math.max(15, zoom / 1.2);
      render();
    },
    onCoords: (fn) => { onHoverCoordsCallback = fn; },
    getCanvas: () => canvas
  };
})();
