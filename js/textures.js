/**
 * ARCHITECT STUDIO 3D - Procedural PBR Texture Generator
 * High-performance, self-contained Canvas-based textures for Three.js
 */

window.ArchTextures = (function() {
  const cache = {};

  // Helper to create an HTML5 offscreen canvas
  function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // 1. Natural European Oak Wood
  function generateOakWood() {
    if (cache.wood_oak) return cache.wood_oak;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base warm oak tone
    ctx.fillStyle = '#caa376';
    ctx.fillRect(0, 0, size, size);

    // Plank lines
    const plankWidth = 64;
    for (let x = 0; x < size; x += plankWidth) {
      // Slight tone shift per plank
      const shift = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgba(${(Math.random() > 0.5 ? 255 : 0)}, ${(Math.random() > 0.5 ? 200 : 0)}, 0, 0.04)`;
      ctx.fillRect(x, 0, plankWidth, size);

      // Plank bevel gap
      ctx.fillStyle = 'rgba(70, 45, 25, 0.35)';
      ctx.fillRect(x, 0, 2, size);
    }

    // Wood fiber grain lines
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i++) {
      const y = Math.random() * size;
      const alpha = 0.05 + Math.random() * 0.08;
      ctx.strokeStyle = `rgba(80, 50, 25, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        size * 0.3, y + (Math.random() - 0.5) * 8,
        size * 0.7, y + (Math.random() - 0.5) * 8,
        size, y
      );
      ctx.stroke();
    }

    cache.wood_oak = canvas;
    return canvas;
  }

  // 2. Dark Smoked Walnut Wood
  function generateWalnutWood() {
    if (cache.wood_walnut) return cache.wood_walnut;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4a3328';
    ctx.fillRect(0, 0, size, size);

    const plankWidth = 85;
    for (let x = 0; x < size; x += plankWidth) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      if (Math.random() > 0.5) ctx.fillRect(x, 0, plankWidth, size);
      ctx.fillStyle = 'rgba(25, 15, 10, 0.5)';
      ctx.fillRect(x, 0, 2, size);
    }

    for (let i = 0; i < 350; i++) {
      const y = Math.random() * size;
      ctx.strokeStyle = `rgba(20, 10, 5, ${0.08 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.4, y + (Math.random() - 0.5) * 10, size * 0.8, y + (Math.random() - 0.5) * 10, size, y);
      ctx.stroke();
    }

    cache.wood_walnut = canvas;
    return canvas;
  }

  // 3. Polished Carrara White Marble
  function generateCarraraMarble() {
    if (cache.marble_carrara) return cache.marble_carrara;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base pure white with subtle warm tint
    ctx.fillStyle = '#f6f7f9';
    ctx.fillRect(0, 0, size, size);

    // Large soft cloud shading
    const grad = ctx.createRadialGradient(size * 0.3, size * 0.4, 20, size * 0.5, size * 0.5, size * 0.7);
    grad.addColorStop(0, 'rgba(235, 238, 242, 0.8)');
    grad.addColorStop(1, 'rgba(248, 249, 251, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle organic veins
    ctx.strokeStyle = 'rgba(120, 130, 145, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.2);
    ctx.bezierCurveTo(size * 0.25, size * 0.35, size * 0.45, size * 0.1, size * 0.7, size * 0.6);
    ctx.bezierCurveTo(size * 0.85, size * 0.85, size * 0.9, size * 0.9, size, size * 0.95);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(90, 100, 115, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.22);
    ctx.bezierCurveTo(size * 0.3, size * 0.33, size * 0.5, size * 0.12, size * 0.7, size * 0.58);
    ctx.bezierCurveTo(size * 0.82, size * 0.8, size * 0.92, size * 0.88, size, size * 0.93);
    ctx.stroke();

    // Secondary vein branch
    ctx.strokeStyle = 'rgba(140, 150, 165, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size * 0.4, size * 0.25);
    ctx.bezierCurveTo(size * 0.6, size * 0.3, size * 0.8, size * 0.2, size, size * 0.35);
    ctx.stroke();

    // Tile grid border (subtle large format 100x100cm tiles)
    ctx.strokeStyle = 'rgba(180, 185, 195, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, size, size);

    cache.marble_carrara = canvas;
    return canvas;
  }

  // 4. Polished Concrete
  function generatePolishedConcrete() {
    if (cache.concrete_polished) return cache.concrete_polished;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(0, 0, size, size);

    // Fine aggregate speckles
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle expansion joint line
    ctx.strokeStyle = 'rgba(60, 65, 70, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    cache.concrete_polished = canvas;
    return canvas;
  }

  // 5. Chevron Tile Pattern
  function generateChevronTile() {
    if (cache.tile_chevron) return cache.tile_chevron;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dcd5c2';
    ctx.fillRect(0, 0, size, size);

    const step = 64;
    ctx.strokeStyle = 'rgba(80, 70, 60, 0.4)';
    ctx.lineWidth = 2;

    for (let y = -step; y < size + step; y += step) {
      for (let x = 0; x < size; x += step * 2) {
        // Tile 1: diagonal up-right
        ctx.fillStyle = (x + y) % 128 === 0 ? '#ded8c8' : '#d2cbba';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + step, y + step / 2);
        ctx.lineTo(x + step, y + step * 1.5);
        ctx.lineTo(x, y + step);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tile 2: diagonal down-right
        ctx.fillStyle = (x + y) % 128 === 0 ? '#d5cebd' : '#e0dacf';
        ctx.beginPath();
        ctx.moveTo(x + step, y + step / 2);
        ctx.lineTo(x + step * 2, y);
        ctx.lineTo(x + step * 2, y + step);
        ctx.lineTo(x + step, y + step * 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    cache.tile_chevron = canvas;
    return canvas;
  }

  // 6. Graphite Dark Slate Tile
  function generateDarkSlate() {
    if (cache.tile_slate) return cache.tile_slate;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2c313a';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Grout grid
    ctx.strokeStyle = 'rgba(15, 18, 22, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, size, size);

    cache.tile_slate = canvas;
    return canvas;
  }

  // 7. Outdoor Teak Wood Deck Planks
  function generateTeakDeck() {
    if (cache.deck_teak) return cache.deck_teak;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9e6738';
    ctx.fillRect(0, 0, size, size);

    const plankH = 42;
    for (let y = 0; y < size; y += plankH) {
      // Wood plank tone variation
      ctx.fillStyle = `rgba(${(Math.random() > 0.5 ? 40 : -30)}, 0, 0, 0.08)`;
      ctx.fillRect(0, y, size, plankH);

      // Plank gap shadow
      ctx.fillStyle = 'rgba(30, 15, 5, 0.6)';
      ctx.fillRect(0, y, size, 3);

      // Screw / fastener rivets
      ctx.fillStyle = 'rgba(40, 30, 20, 0.6)';
      ctx.beginPath();
      ctx.arc(35, y + plankH / 2, 2.5, 0, Math.PI * 2);
      ctx.arc(size - 35, y + plankH / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    cache.deck_teak = canvas;
    return canvas;
  }

  // 8. Emerald Lawn Grass (Enhanced Natural Zacate / Césped)
  function generateGrass() {
    if (cache.grass_emerald) return cache.grass_emerald;
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Rich deep organic base lawn color
    const baseGrad = ctx.createLinearGradient(0, 0, size, size);
    baseGrad.addColorStop(0, '#235924');
    baseGrad.addColorStop(0.5, '#2c6e2d');
    baseGrad.addColorStop(1, '#1e4d1f');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Micro-texture stippling (soil and root bed variation)
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 26;
      data[i] = Math.min(255, Math.max(0, data[i] + n * 0.4));     // R (low)
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));   // G (vibrant)
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.3)); // B (low)
    }
    ctx.putImageData(imgData, 0, 0);

    // Fine organic grass blades (2500 varied blades with multiple green hues)
    const bladeColors = [
      'rgba(67, 160, 71, 0.45)',   // Vibrant lime emerald
      'rgba(46, 125, 50, 0.55)',   // Rich lawn green
      'rgba(27, 94, 32, 0.50)',    // Deep forest green
      'rgba(129, 199, 132, 0.35)', // Sunlight tip highlight
      'rgba(20, 70, 24, 0.60)'     // Under-shade dark
    ];

    for (let i = 0; i < 2800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 4 + Math.random() * 8;
      const curve = (Math.random() - 0.5) * 5;
      const col = bladeColors[Math.floor(Math.random() * bladeColors.length)];
      
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8 + Math.random() * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + curve, y - len * 0.5, x + curve * 1.5, y - len);
      ctx.stroke();
    }

    cache.grass_emerald = canvas;
    return canvas;
  }

  // 9. OLED TV Display Graphic
  function generateOledScreen() {
    if (cache.screen_oled) return cache.screen_oled;
    const w = 512, h = 288;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Rich dark gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a192f');
    grad.addColorStop(0.5, '#172a45');
    grad.addColorStop(1, '#020c1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Architectural villa sketch graphic
    ctx.strokeStyle = '#64ffda';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // House outline
    ctx.moveTo(100, 200);
    ctx.lineTo(100, 110);
    ctx.lineTo(260, 60);
    ctx.lineTo(410, 110);
    ctx.lineTo(410, 200);
    ctx.closePath();
    ctx.stroke();

    // Internal architectural lines
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.4)';
    ctx.strokeRect(130, 120, 60, 50);
    ctx.strokeRect(220, 120, 80, 80);
    ctx.strokeRect(330, 120, 50, 50);

    // Modern title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('INNOVA ARCHITECT', 160, 240);

    ctx.fillStyle = '#64ffda';
    ctx.font = '11px monospace';
    ctx.fillText('LIVE 3D BIM REALTIME ENGINE • 4K HDR', 140, 260);

    cache.screen_oled = canvas;
    return canvas;
  }

  // 10. Subtle Woven Fabric Bump
  function generateFabricBump() {
    if (cache.fabric_bump) return cache.fabric_bump;
    const size = 128;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    cache.fabric_bump = canvas;
    return canvas;
  }

  // Main Public API to get THREE.Texture directly
  return {
    getTexture: function(materialId, THREE_LIB) {
      if (!THREE_LIB) return null;
      let canvas = null;

      switch (materialId) {
        case 'wood_oak': canvas = generateOakWood(); break;
        case 'wood_walnut': canvas = generateWalnutWood(); break;
        case 'marble_carrara': canvas = generateCarraraMarble(); break;
        case 'concrete_polished': canvas = generatePolishedConcrete(); break;
        case 'tile_chevron': canvas = generateChevronTile(); break;
        case 'tile_slate': canvas = generateDarkSlate(); break;
        case 'deck_teak': canvas = generateTeakDeck(); break;
        case 'grass_emerald': canvas = generateGrass(); break;
        case 'screen_oled': canvas = generateOledScreen(); break;
        case 'fabric_bump': canvas = generateFabricBump(); break;
        default: canvas = generateOakWood(); break;
      }

      if (!canvas) return null;
      const texture = new THREE_LIB.CanvasTexture(canvas);
      texture.wrapS = THREE_LIB.RepeatWrapping;
      texture.wrapT = THREE_LIB.RepeatWrapping;
      texture.repeat.set(2, 2);
      return texture;
    },

    getCanvas: function(materialId) {
      switch (materialId) {
        case 'wood_oak': return generateOakWood();
        case 'wood_walnut': return generateWalnutWood();
        case 'marble_carrara': return generateCarraraMarble();
        case 'concrete_polished': return generatePolishedConcrete();
        case 'tile_chevron': return generateChevronTile();
        case 'tile_slate': return generateDarkSlate();
        case 'deck_teak': return generateTeakDeck();
        case 'grass_emerald': return generateGrass();
        case 'screen_oled': return generateOledScreen();
        default: return generateOakWood();
      }
    }
  };
})();
