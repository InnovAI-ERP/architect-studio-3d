/**
 * ARCHITECT STUDIO 3D - 2D CAD Blueprint Engine
 * Full interactive CAD suite: Wall drawing & stretching, arbitrary polygon rooms,
 * organic grass lawn stippling, item mirroring & metric HUD
 */

window.ArchRenderer2D = (function() {
  let canvas, ctx;
  let container;
  let width = 0, height = 0;
  
  // Transform State (Pan & Zoom)
  let zoom = 55; // Pixels per meter
  let panX = 180;
  let panY = 120;
  
  // Interaction State
  let isDragging = false;
  let isPanning = false;
  let isRotating = false;
  let isDraggingWallHandle = null; // 'p1' | 'p2' | 'body'
  let isDraggingPolyVertex = null; // index
  let isDraggingRoom = false;
  let initialRoomCoords = null;
  let dragStartX = 0, dragStartY = 0;
  let initialItemX = 0, initialItemY = 0;
  let initialWallCoords = null;
  let initialRotation = 0;
  let hoveredItemId = null;
  let hoveredWallId = null;
  let onHoverCoordsCallback = null;

  // Active Tool Drawing States
  let wallDrawStart = null; // { x, y }
  let polygonDraftPoints = []; // [{ x, y }, ...]
  let currentMouseWorld = { x: 0, y: 0 };

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

    // 1. Technical Architectural Grid
    drawGrid(state);

    // 2. Ghost Floor (Planta Inferior / Superior en semitransparente)
    if (state.ghostFloor && state.floors.length > 1) {
      drawGhostFloors(state, activeFloorId);
    }

    // 3. Rectangular Rooms & Grass Zones
    drawRooms(state, activeFloorId);

    // 4. Polygonal Custom Rooms (Ambientes Libres)
    drawPolygonRooms(state, activeFloorId);

    // 5. Architectural Walls
    drawWalls(state, activeFloorId);

    // 6. Furniture & Utensils CAD Symbols (with Mirror/Flip support)
    drawItems(state, activeFloorId);

    // 7. Interactive Drawing Previews (Wall tool & Polygon tool)
    drawToolPreviews(state);

    // 8. Active Selection Bounding Box & Gizmo
    drawSelectionGizmo(state);

    // 9. Architectural Scale Bar (HUD)
    drawScaleBar();
  }

  // 1. Grid
  function drawGrid(state) {
    ctx.save();
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

    // World Origin (0,0)
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
    ctx.fillText('(0.0, 0.0) ORIGEN PLANO', origin.x + 6, origin.y + 14);

    ctx.restore();
  }

  // 2. Ghost Floors
  function drawGhostFloors(state, activeFloorId) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.setLineDash([4, 4]);

    state.floors.forEach(f => {
      if (f.id === activeFloorId || !f.visible) return;
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

  // 3. Rectangular Rooms & Grass Areas
  function drawRooms(state, activeFloorId) {
    const rooms = state.rooms.filter(r => r.floorId === activeFloorId);

    rooms.forEach(room => {
      const p = worldToScreen(room.x, room.y);
      const rw = room.width * zoom;
      const rh = room.depth * zoom;

      ctx.save();

      // Grass / Zacate dedicated drawing
      if (room.floorMaterial === 'grass_emerald') {
        drawGrassArea2D(p.x, p.y, rw, rh, room.name);
      } else {
        let roomFill = 'rgba(255, 255, 255, 0.03)';
        if (room.floorMaterial === 'wood_oak') roomFill = 'rgba(196, 154, 108, 0.08)';
        else if (room.floorMaterial === 'marble_carrara') roomFill = 'rgba(240, 240, 242, 0.08)';
        else if (room.floorMaterial === 'deck_teak') roomFill = 'rgba(160, 106, 59, 0.09)';
        else if (room.floorMaterial === 'tile_slate') roomFill = 'rgba(50, 55, 62, 0.25)';

        ctx.fillStyle = roomFill;
        ctx.fillRect(p.x, p.y, rw, rh);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, rw, rh);

        // Dimension lines
        drawDimensionLine(p.x, p.y - 12, p.x + rw, p.y - 12, `${room.width.toFixed(2)} m`);
        drawDimensionLine(p.x - 12, p.y, p.x - 12, p.y + rh, `${room.depth.toFixed(2)} m`, true);

        // Central Badge
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
      }

      ctx.restore();
    });
  }

  // Dedicated 2D Grass / Zacate Stippling & Tuft Renderer
  function drawGrassArea2D(x, y, w, h, label) {
    ctx.save();
    // Soft emerald lawn tint
    ctx.fillStyle = 'rgba(45, 110, 46, 0.15)';
    ctx.fillRect(x, y, w, h);

    // Natural stone garden border
    ctx.strokeStyle = '#2d6e2e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Organic grass tuft icons (v-shapes) across the area
    ctx.strokeStyle = 'rgba(74, 175, 77, 0.4)';
    ctx.lineWidth = 1;

    const stepX = 28;
    const stepY = 28;
    for (let gx = x + 14; gx < x + w - 10; gx += stepX) {
      for (let gy = y + 14; gy < y + h - 10; gy += stepY) {
        // Draw 3-blade tuft
        ctx.beginPath();
        ctx.moveTo(gx - 4, gy);
        ctx.lineTo(gx - 6, gy - 7);
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy - 9);
        ctx.moveTo(gx + 4, gy);
        ctx.lineTo(gx + 6, gy - 7);
        ctx.stroke();
      }
    }

    // Badge
    const cx = x + w / 2;
    const cy = y + h / 2;
    const areaM2 = ((w / zoom) * (h / zoom)).toFixed(2);

    ctx.fillStyle = 'rgba(20, 50, 22, 0.85)';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1;
    roundRect(ctx, cx - 80, cy - 18, 160, 36, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🌿 ${label}`, cx, cy - 3);

    ctx.fillStyle = '#bbf7d0';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(`ZACATE: ${areaM2} m²`, cx, cy + 10);

    ctx.restore();
  }

  // 4. Polygonal Custom Rooms (Ambientes Libres No Rectangulares)
  function drawPolygonRooms(state, activeFloorId) {
    const polys = (state.polygonRooms || []).filter(pr => pr.floorId === activeFloorId);

    polys.forEach(poly => {
      if (!poly.points || poly.points.length < 3) return;

      ctx.save();
      const isSelected = (state.selectedId === poly.id && state.selectedType === 'polygon_room');

      // Build screen path
      ctx.beginPath();
      const start = worldToScreen(poly.points[0].x, poly.points[0].y);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < poly.points.length; i++) {
        const pt = worldToScreen(poly.points[i].x, poly.points[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      // Fill
      if (poly.floorMaterial === 'grass_emerald') {
        ctx.fillStyle = 'rgba(45, 110, 46, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = isSelected ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#00d2ff' : '#94a3b8';
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.stroke();
      }

      // Draw edge dimensions
      const n = poly.points.length;
      let sumX = 0, sumY = 0;

      for (let i = 0; i < n; i++) {
        const p1 = poly.points[i];
        const p2 = poly.points[(i + 1) % n];
        sumX += p1.x;
        sumY += p1.y;

        const s1 = worldToScreen(p1.x, p1.y);
        const s2 = worldToScreen(p2.x, p2.y);
        const edgeLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        // Edge metric label
        const midX = (s1.x + s2.x) / 2;
        const midY = (s1.y + s2.y) / 2;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${edgeLen.toFixed(2)}m`, midX, midY - 4);

        // If selected, draw vertex grip handles
        if (isSelected) {
          ctx.fillStyle = '#00d2ff';
          ctx.beginPath();
          ctx.arc(s1.x, s1.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Centroid
      const centroidX = sumX / n;
      const centroidY = sumY / n;
      const sc = worldToScreen(centroidX, centroidY);
      const polyArea = window.ArchState.calculatePolygonArea(poly.points);

      // Centroid badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isSelected ? '#00d2ff' : '#475569';
      ctx.lineWidth = 1;
      roundRect(ctx, sc.x - 85, sc.y - 18, 170, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#00d2ff' : '#f8fafc';
      ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(poly.name, sc.x, sc.y - 3);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`ÁREA: ${polyArea.toFixed(2)} m²`, sc.x, sc.y + 10);

      ctx.restore();
    });
  }

  // Dimension Line Helper
  function drawDimensionLine(x1, y1, x2, y2, text, vertical = false) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const tick = 4;
    ctx.beginPath();
    ctx.moveTo(x1 - tick, y1 - tick);
    ctx.lineTo(x1 + tick, y1 + tick);
    ctx.moveTo(x2 - tick, y2 - tick);
    ctx.lineTo(x2 + tick, y2 + tick);
    ctx.stroke();

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

  // 5. Architectural Walls with Stretch Handles
  function drawWalls(state, activeFloorId) {
    const walls = state.walls.filter(w => w.floorId === activeFloorId);

    ctx.save();
    walls.forEach(w => {
      const p1 = worldToScreen(w.x1, w.y1);
      const p2 = worldToScreen(w.x2, w.y2);
      const thick = (w.thickness || 0.18) * zoom;
      const isSelected = (state.selectedId === w.id && state.selectedType === 'wall');
      const isHovered = (hoveredWallId === w.id);

      // Core
      ctx.strokeStyle = isSelected ? '#00d2ff' : (isHovered ? '#38bdf8' : '#0f172a');
      ctx.lineWidth = thick;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Outer Edge Lines
      ctx.strokeStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Wall Length Measurement
      const wallLen = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.fillStyle = isSelected ? '#00d2ff' : '#94a3b8';
      ctx.font = '8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${wallLen.toFixed(2)}m`, midX, midY - thick / 2 - 4);

      // Interactive Stretch Handles at Endpoints (p1 and p2)
      if (isSelected) {
        // Endpoint 1 Handle
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Endpoint 2 Handle
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // 6. Furniture & Utensils CAD Symbols (with Mirror/Flip support)
  function drawItems(state, activeFloorId) {
    const items = state.items.filter(it => it.floorId === activeFloorId);

    items.forEach(item => {
      ctx.save();
      const pos = worldToScreen(item.x, item.y);
      const iw = item.width * zoom;
      const id = item.depth * zoom;

      ctx.translate(pos.x, pos.y);
      ctx.rotate((item.rotation || 0) * (Math.PI / 180));

      // Apply horizontal and vertical mirroring in 2D CAD
      ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);

      const isSelected = (state.selectedId === item.id && state.selectedType === 'item');
      const isHovered = (hoveredItemId === item.id);

      ctx.fillStyle = isSelected ? 'rgba(0, 210, 255, 0.18)' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 41, 59, 0.85)');
      ctx.strokeStyle = isSelected ? '#00d2ff' : (isHovered ? '#f8fafc' : '#64748b');
      ctx.lineWidth = isSelected ? 2 : 1.2;

      drawCadSymbol(item, -iw / 2, -id / 2, iw, id);

      // Label
      ctx.save();
      // Counteract scale so text isn't flipped backwards
      ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);
      ctx.fillStyle = isSelected ? '#00d2ff' : '#cbd5e1';
      ctx.font = '8.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.split(' ')[0], 0, id / 2 + 12);
      ctx.restore();

      ctx.restore();
    });
  }

  // CAD Symbols
  function drawCadSymbol(item, x, y, w, h) {
    const cid = item.catalogId;

    if (cid.startsWith('stair')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

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

      ctx.strokeStyle = '#00d2ff';
      ctx.fillStyle = '#00d2ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h - 10);
      ctx.lineTo(x + w / 2, y + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 5, y + 16);
      ctx.lineTo(x + w / 2, y + 8);
      ctx.lineTo(x + w / 2 + 5, y + 16);
      ctx.stroke();

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SUBE', x + w / 2, y + h / 2);

    } else if (cid.startsWith('sofa')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h * 0.25);
      if (w > h) {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h * 0.25);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();
      }
      ctx.strokeRect(x, y, w * 0.15, h);
      ctx.strokeRect(x + w * 0.85, y, w * 0.15, h);

    } else if (cid.startsWith('bed')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h * 0.12);
      const pW = w * 0.38;
      const pH = h * 0.18;
      ctx.strokeRect(x + w * 0.08, y + h * 0.16, pW, pH);
      ctx.strokeRect(x + w * 0.54, y + h * 0.16, pW, pH);
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.45);
      ctx.lineTo(x + w, y + h * 0.45);
      ctx.stroke();

    } else if (cid.startsWith('kitchen_island')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.strokeRect(x + w * 0.15, y + h * 0.2, w * 0.3, h * 0.6);
      ctx.strokeRect(x + w * 0.28, y + h * 0.2, w * 0.15, h * 0.6);
      ctx.beginPath();
      ctx.arc(x + w * 0.29, y + h * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (cid.startsWith('dining_table')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      const chairW = w * 0.22;
      const chairH = h * 0.25;
      for (let i = 0; i < 3; i++) {
        ctx.strokeRect(x + w * 0.1 + i * w * 0.3, y - chairH * 0.8, chairW, chairH);
        ctx.strokeRect(x + w * 0.1 + i * w * 0.3, y + h - chairH * 0.2, chairW, chairH);
      }

    } else if (cid.startsWith('door')) {
      ctx.strokeRect(x, y - 2, w, 4);
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([3, 3]);
      ctx.arc(x, y, w, 0, Math.PI / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + w);
      ctx.stroke();

    } else if (cid.startsWith('window')) {
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();

    } else if (cid.startsWith('bathtub')) {
      roundRect(ctx, x, y, w, h, Math.min(w, h) / 2);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, x + 4, y + 4, w - 8, h - 8, Math.min(w, h) / 2 - 4);
      ctx.stroke();

    } else if (cid.startsWith('vanity')) {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, Math.PI * 2);
      ctx.stroke();

    } else if (cid.startsWith('plant')) {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let a = 0; a < 6; a++) {
        const ang = a * (Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h / 2);
        ctx.lineTo(x + w / 2 + Math.cos(ang) * (w / 2), y + h / 2 + Math.sin(ang) * (h / 2));
        ctx.stroke();
      }

    } else {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    }
  }

  // 7. Interactive Drawing Previews (Muros y Polígonos en proceso)
  function drawToolPreviews(state) {
    ctx.save();

    // 7A. Wall Drawing Preview
    if (state.activeTool === 'draw_wall' && wallDrawStart) {
      const p1 = worldToScreen(wallDrawStart.x, wallDrawStart.y);
      const p2 = worldToScreen(currentMouseWorld.x, currentMouseWorld.y);
      const len = Math.hypot(currentMouseWorld.x - wallDrawStart.x, currentMouseWorld.y - wallDrawStart.y);

      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 0.18 * zoom;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Measurement tag
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = '#00d2ff';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🧱 Longitud: ${len.toFixed(2)} m (Clic para fijar)`, midX, midY - 14);
    }

    // 7B. Polygon Drawing Preview
    if (state.activeTool === 'draw_polygon' && polygonDraftPoints.length > 0) {
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      const start = worldToScreen(polygonDraftPoints[0].x, polygonDraftPoints[0].y);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < polygonDraftPoints.length; i++) {
        const pt = worldToScreen(polygonDraftPoints[i].x, polygonDraftPoints[i].y);
        ctx.lineTo(pt.x, pt.y);
      }

      // Rubberband to current mouse
      const cur = worldToScreen(currentMouseWorld.x, currentMouseWorld.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
      ctx.fill();

      // Points markers
      polygonDraftPoints.forEach((p, idx) => {
        const sp = worldToScreen(p.x, p.y);
        ctx.fillStyle = idx === 0 ? '#facc15' : '#22c55e';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, idx === 0 ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Tooltip
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Puntos: ${polygonDraftPoints.length} • Clic en punto amarillo para cerrar polígono`, cur.x, cur.y - 12);
    }

    ctx.restore();
  }

  // 8. Selection Bounding Box & Interactive Handles
  function drawSelectionGizmo(state) {
    if (!state.selectedId) return;

    // 8A. Selected Room Gizmo
    if (state.selectedType === 'room') {
      const room = state.rooms.find(r => r.id === state.selectedId);
      if (!room || room.floorId !== state.activeFloorId) return;

      ctx.save();
      const p = worldToScreen(room.x, room.y);
      const rw = room.width * zoom;
      const rh = room.depth * zoom;

      // Glowing animated cyan boundary
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(p.x - 2, p.y - 2, rw + 4, rh + 4);
      ctx.setLineDash([]);

      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;

      const corners = [
        [p.x - 2, p.y - 2],
        [p.x + rw + 2, p.y - 2],
        [p.x + rw + 2, p.y + rh + 2],
        [p.x - 2, p.y + rh + 2]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      });

      // Move Space Central Tooltip Badge
      ctx.fillStyle = 'rgba(0, 210, 255, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      const badgeW = 160;
      const badgeH = 24;
      roundRect(ctx, p.x + rw / 2 - badgeW / 2, p.y + rh / 2 - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#05101a';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✋ Arrastrar para Mover Espacio', p.x + rw / 2, p.y + rh / 2 + 3);

      ctx.restore();
      return;
    }

    if (state.selectedType !== 'item') return;
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

    // Rotation Handle
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
    const mirrorTag = (item.flipX || item.flipY) ? ` [🪞 Espejo]` : '';
    ctx.fillText(`${item.width.toFixed(2)}m × ${item.depth.toFixed(2)}m (${item.rotation || 0}°)${mirrorTag}`, 0, -rotDist - 10);

    ctx.restore();
  }

  // 9. Scale Bar
  function drawScaleBar() {
    ctx.save();
    const barX = 25;
    const barY = height - 25;
    const meterPx = zoom;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + meterPx * 2, barY);
    ctx.stroke();

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

  // Event Handling & Tool Dispatcher
  function setupEvents() {
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDoubleClick);
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

  function findRoomAt(wx, wy, state) {
    const rooms = state.rooms.filter(r => r.floorId === state.activeFloorId);
    for (let i = rooms.length - 1; i >= 0; i--) {
      const r = rooms[i];
      if (wx >= r.x && wx <= r.x + r.width && wy >= r.y && wy <= r.y + r.depth) {
        return r;
      }
    }
    return null;
  }

  function findItemAt(wx, wy, state) {
    const activeFloorId = state.activeFloorId;
    const items = state.items.filter(it => it.floorId === activeFloorId);

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

  function findWallAt(wx, wy, state) {
    const activeFloorId = state.activeFloorId;
    const walls = state.walls.filter(w => w.floorId === activeFloorId);
    const threshold = 0.25; // 25cm hit threshold

    for (let i = walls.length - 1; i >= 0; i--) {
      const w = walls[i];
      const dist = distanceToSegment(wx, wy, w.x1, w.y1, w.x2, w.y2);
      if (dist <= threshold) {
        return w;
      }
    }
    return null;
  }

  function distanceToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  function onMouseDown(e) {
    const m = getMouseWorld(e);
    const state = window.ArchState.getState();
    const snap = state.gridSnap;
    const snappedX = snap ? snapValue(m.x, snap) : m.x;
    const snappedY = snap ? snapValue(m.y, snap) : m.y;

    // Pan with middle/right click
    if (e.button === 1 || e.button === 2 || e.spaceKey || e.altKey) {
      isPanning = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      return;
    }

    if (e.button === 0) {
      // 1. Tool Mode: Draw Wall
      if (state.activeTool === 'draw_wall') {
        if (!wallDrawStart) {
          wallDrawStart = { x: snappedX, y: snappedY };
        } else {
          // Finalize wall
          const wLen = Math.hypot(snappedX - wallDrawStart.x, snappedY - wallDrawStart.y);
          if (wLen >= 0.3) {
            window.ArchState.addWall({
              x1: wallDrawStart.x,
              y1: wallDrawStart.y,
              x2: snappedX,
              y2: snappedY
            });
            window.ArchApp.showToast(`Muro creado: ${wLen.toFixed(2)} m`);
          }
          wallDrawStart = null;
        }
        render();
        return;
      }

      // 2. Tool Mode: Draw Polygon Room
      if (state.activeTool === 'draw_polygon') {
        if (polygonDraftPoints.length >= 3) {
          const first = polygonDraftPoints[0];
          const distToFirst = Math.hypot(snappedX - first.x, snappedY - first.y);
          if (distToFirst <= 0.4) {
            // Close polygon room
            window.ArchState.addPolygonRoom({
              name: `Área Poligonal ${state.polygonRooms.length + 1}`,
              points: polygonDraftPoints,
              floorMaterial: 'grass_emerald'
            });
            window.ArchApp.showToast("Ambiente poligonal creado con éxito");
            polygonDraftPoints = [];
            window.ArchState.setActiveTool('select');
            render();
            return;
          }
        }
        polygonDraftPoints.push({ x: snappedX, y: snappedY });
        render();
        return;
      }

      // 3. Selection Mode: Check if clicking selected wall handles
      if (state.selectedId && state.selectedType === 'wall') {
        const wall = state.walls.find(w => w.id === state.selectedId);
        if (wall) {
          const d1 = Math.hypot(m.x - wall.x1, m.y - wall.y1);
          const d2 = Math.hypot(m.x - wall.x2, m.y - wall.y2);
          if (d1 <= 0.35) {
            isDraggingWallHandle = 'p1';
            dragStartX = m.x;
            dragStartY = m.y;
            return;
          }
          if (d2 <= 0.35) {
            isDraggingWallHandle = 'p2';
            dragStartX = m.x;
            dragStartY = m.y;
            return;
          }
        }
      }

      // Check if clicking rotation handle of selected item
      if (state.selectedId && state.selectedType === 'item') {
        const item = state.items.find(it => it.id === state.selectedId);
        if (item) {
          const rotDist = item.depth / 2 + 25 / zoom;
          const rad = ((item.rotation || 0) * Math.PI) / 180;
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
      const hitItem = findItemAt(m.x, m.y, state);
      if (hitItem) {
        window.ArchState.select(hitItem.id, 'item');
        isDragging = true;
        dragStartX = m.x;
        dragStartY = m.y;
        initialItemX = hitItem.x;
        initialItemY = hitItem.y;
        render();
        return;
      }

      // Check wall hit
      const hitWall = findWallAt(m.x, m.y, state);
      if (hitWall) {
        window.ArchState.select(hitWall.id, 'wall');
        isDraggingWallHandle = 'body';
        dragStartX = m.x;
        dragStartY = m.y;
        initialWallCoords = { x1: hitWall.x1, y1: hitWall.y1, x2: hitWall.x2, y2: hitWall.y2 };
        render();
        return;
      }

      // Check polygon room hit
      const hitPoly = state.polygonRooms.find(pr => {
        return pr.floorId === state.activeFloorId && isPointInPolygon(m.x, m.y, pr.points);
      });
      if (hitPoly) {
        window.ArchState.select(hitPoly.id, 'polygon_room');
        render();
        return;
      }

      // Check rectangular room hit (Ambiente / Espacio)
      const hitRoom = findRoomAt(m.x, m.y, state);
      if (hitRoom) {
        window.ArchState.select(hitRoom.id, 'room');
        isDraggingRoom = true;
        dragStartX = m.x;
        dragStartY = m.y;
        initialRoomCoords = { x: hitRoom.x, y: hitRoom.y, width: hitRoom.width, depth: hitRoom.depth };
        render();
        return;
      }

      // Empty space click -> Deselect and Pan
      window.ArchState.deselect();
      isPanning = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    }
    render();
  }

  function isPointInPolygon(x, y, points) {
    if (!points || points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function onMouseMove(e) {
    const m = getMouseWorld(e);
    currentMouseWorld = { x: m.x, y: m.y };
    const state = window.ArchState.getState();
    const snap = state.gridSnap;
    const snappedX = snap ? snapValue(m.x, snap) : m.x;
    const snappedY = snap ? snapValue(m.y, snap) : m.y;

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

    // Wall stretching/moving
    if (isDraggingWallHandle && state.selectedId) {
      const wall = state.walls.find(w => w.id === state.selectedId);
      if (wall) {
        if (isDraggingWallHandle === 'p1') {
          wall.x1 = parseFloat(snappedX.toFixed(2));
          wall.y1 = parseFloat(snappedY.toFixed(2));
        } else if (isDraggingWallHandle === 'p2') {
          wall.x2 = parseFloat(snappedX.toFixed(2));
          wall.y2 = parseFloat(snappedY.toFixed(2));
        } else if (isDraggingWallHandle === 'body' && initialWallCoords) {
          const dx = snappedX - dragStartX;
          const dy = snappedY - dragStartY;
          wall.x1 = parseFloat((initialWallCoords.x1 + dx).toFixed(2));
          wall.y1 = parseFloat((initialWallCoords.y1 + dy).toFixed(2));
          wall.x2 = parseFloat((initialWallCoords.x2 + dx).toFixed(2));
          wall.y2 = parseFloat((initialWallCoords.y2 + dy).toFixed(2));
        }
        window.ArchState.updateWall(wall.id, { x1: wall.x1, y1: wall.y1, x2: wall.x2, y2: wall.y2 }, false);
        render();
        return;
      }
    }

    // Room moving / dragging
    if (isDraggingRoom && state.selectedId && state.selectedType === 'room') {
      const room = state.rooms.find(r => r.id === state.selectedId);
      if (room && initialRoomCoords) {
        let newX = initialRoomCoords.x + (m.x - dragStartX);
        let newY = initialRoomCoords.y + (m.y - dragStartY);
        if (snap) {
          newX = snapValue(newX, snap);
          newY = snapValue(newY, snap);
        }
        room.x = parseFloat(newX.toFixed(2));
        room.y = parseFloat(newY.toFixed(2));
        window.ArchState.updateRoom(room.id, { x: room.x, y: room.y }, false);
        render();
        return;
      }
    }

    // Item moving
    if (isDragging && state.selectedId && state.selectedType === 'item') {
      const item = state.items.find(it => it.id === state.selectedId);
      if (item && !item.locked) {
        let newX = initialItemX + (m.x - dragStartX);
        let newY = initialItemY + (m.y - dragStartY);
        if (snap) {
          newX = snapValue(newX, snap);
          newY = snapValue(newY, snap);
        }
        item.x = parseFloat(newX.toFixed(2));
        item.y = parseFloat(newY.toFixed(2));
        window.ArchState.updateItem(item.id, { x: item.x, y: item.y }, false);
        render();
      }
      return;
    }

    // Item rotating
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

    // If drawing tools active, re-render preview
    if (state.activeTool === 'draw_wall' || state.activeTool === 'draw_polygon') {
      render();
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
    isDraggingWallHandle = null;
    isDraggingRoom = false;
    initialRoomCoords = null;
    initialWallCoords = null;
  }

  function onDoubleClick(e) {
    const state = window.ArchState.getState();
    if (state.activeTool === 'draw_polygon' && polygonDraftPoints.length >= 3) {
      window.ArchState.addPolygonRoom({
        name: `Área Poligonal ${state.polygonRooms.length + 1}`,
        points: polygonDraftPoints,
        floorMaterial: 'grass_emerald'
      });
      window.ArchApp.showToast("Ambiente poligonal cerrado con doble clic");
      polygonDraftPoints = [];
      window.ArchState.setActiveTool('select');
      render();
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.max(15, Math.min(220, zoom * zoomFactor));

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;

    render();
  }

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
    cancelDrawing: () => {
      wallDrawStart = null;
      polygonDraftPoints = [];
      render();
    },
    getCanvas: () => canvas
  };
})();
