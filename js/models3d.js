/**
 * ARCHITECT STUDIO 3D - Procedural 3D Model Builders
 * High-detail architectural assets using Three.js procedural geometry & PBR shaders
 */

window.ArchModels = (function() {

  // Helper to create basic materials with shadows
  function createMat(THREE, color, roughness = 0.5, metalness = 0.1, bumpMap = null) {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: roughness,
      metalness: metalness
    });
    if (bumpMap) {
      mat.bumpMap = bumpMap;
      mat.bumpScale = 0.05;
    }
    return mat;
  }

  // 1. ESCALERA RECTA ARQUITECTÓNICA DE DISEÑO (Refined Floating Cantilever Staircase)
  function buildStairStraight(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 1.10;
    const d = item.depth || 3.50;
    const h = item.height || 2.80;
    const steps = 16;
    const stepDepth = d / steps;
    const stepHeight = h / steps;
    const treadThickness = 0.055;

    // Materials
    const woodTexture = window.ArchTextures.getTexture(item.material || 'wood_oak', THREE);
    const treadMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.35,
      metalness: 0.05
    });
    const steelMat = createMat(THREE, '#1e242d', 0.25, 0.75); // Dark architectural graphite steel
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.95,
      ior: 1.52
    });
    const handrailMat = createMat(THREE, '#e5e7eb', 0.15, 0.9); // Brushed stainless steel
    const standoffMat = createMat(THREE, '#cbd5e1', 0.1, 0.95);

    // Individual Cantilevered Floating Treads (Peldaños de madera maciza biselados)
    const treadGeo = new THREE.BoxGeometry(w, treadThickness, stepDepth * 1.12);
    for (let i = 0; i < steps; i++) {
      const tread = new THREE.Mesh(treadGeo, treadMat);
      tread.castShadow = true;
      tread.receiveShadow = true;
      const y = (i + 1) * stepHeight - treadThickness / 2;
      const z = -d / 2 + (i + 0.5) * stepDepth;
      tread.position.set(0, y, z);
      group.add(tread);

      // Slender steel brackets under each tread (Soportes discretos)
      const bracketGeo = new THREE.BoxGeometry(w * 0.7, 0.02, 0.08);
      const bracket = new THREE.Mesh(bracketGeo, steelMat);
      bracket.position.set(0, y - treadThickness / 2 - 0.01, z);
      group.add(bracket);
    }

    // Dual Slender Side Stringers (Zancas laterales estilizadas de perfil fino, NO bloque macizo)
    const stringerHypot = Math.hypot(d, h);
    const stringerAngle = -Math.atan2(h, d);
    const stringerGeo = new THREE.BoxGeometry(0.04, 0.08, stringerHypot);

    for (let side of [-1, 1]) {
      const stringer = new THREE.Mesh(stringerGeo, steelMat);
      stringer.castShadow = true;
      stringer.receiveShadow = true;
      stringer.position.set(side * (w / 2 - 0.06), h / 2 - 0.12, 0);
      stringer.rotation.x = stringerAngle;
      group.add(stringer);
    }

    // Glass Balustrade (Barandilla de cristal templado arquitectónico)
    const balustradeHeight = 0.95;
    const glassGeo = new THREE.BoxGeometry(0.015, balustradeHeight, stringerHypot * 0.95);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(w / 2 - 0.02, h / 2 + balustradeHeight / 2 - 0.05, 0);
    glass.rotation.x = stringerAngle;
    group.add(glass);

    // Standoff Glass Mounting Buttons (Botones de acero inoxidable para sujeción)
    const standoffGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16);
    standoffGeo.rotateZ(Math.PI / 2);
    for (let s = 0; s < 5; s++) {
      const sFrac = (s + 0.5) / 5;
      const sz = -d / 2 + sFrac * d;
      const sy = sFrac * h;
      const standoff = new THREE.Mesh(standoffGeo, standoffMat);
      standoff.position.set(w / 2 - 0.02, sy + 0.05, sz);
      group.add(standoff);
    }

    // Sleek Stainless Steel Top Handrail (Pasamanos continuo de acero inox)
    const railGeo = new THREE.CylinderGeometry(0.02, 0.02, stringerHypot * 0.96, 16);
    const rail = new THREE.Mesh(railGeo, handrailMat);
    rail.castShadow = true;
    rail.position.set(w / 2 - 0.02, h / 2 + balustradeHeight, 0);
    rail.rotation.x = Math.PI / 2 + stringerAngle;
    group.add(rail);

    return group;
  }

  // 2. ESCALERA EN L CON DESCANSO
  function buildStairLShape(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.20;
    const d = item.depth || 2.60;
    const h = item.height || 2.80;
    const treadThickness = 0.055;

    const woodTexture = window.ArchTextures.getTexture(item.material || 'wood_oak', THREE);
    const treadMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.35 });
    const steelMat = createMat(THREE, '#1e242d', 0.25, 0.75);

    // Tramo 1 (Subida hasta descanso: 8 escalones)
    const steps1 = 8;
    const h1 = h * 0.5;
    const d1 = d - 1.0;
    const stepH1 = h1 / steps1;
    const stepD1 = d1 / steps1;
    const treadW = 1.0;

    const treadGeo1 = new THREE.BoxGeometry(treadW, treadThickness, stepD1 * 1.1);
    for (let i = 0; i < steps1; i++) {
      const tread = new THREE.Mesh(treadGeo1, treadMat);
      tread.castShadow = true;
      tread.position.set(-w / 2 + treadW / 2, (i + 1) * stepH1 - treadThickness / 2, -d / 2 + (i + 0.5) * stepD1);
      group.add(tread);
    }

    // Descanso intermedio (Landing 1.0m x 1.0m)
    const landingGeo = new THREE.BoxGeometry(treadW * 1.05, treadThickness, 1.05);
    const landing = new THREE.Mesh(landingGeo, treadMat);
    landing.castShadow = true;
    landing.position.set(-w / 2 + treadW / 2, h1 - treadThickness / 2, d / 2 - 0.5);
    group.add(landing);

    // Tramo 2 (Giro 90° hacia la derecha: 8 escalones)
    const steps2 = 8;
    const stepW2 = (w - 1.0) / steps2;
    const treadGeo2 = new THREE.BoxGeometry(stepW2 * 1.1, treadThickness, 1.0);
    for (let i = 0; i < steps2; i++) {
      const tread = new THREE.Mesh(treadGeo2, treadMat);
      tread.castShadow = true;
      tread.position.set(-w / 2 + treadW + (i + 0.5) * stepW2, h1 + (i + 1) * stepH1 - treadThickness / 2, d / 2 - 0.5);
      group.add(tread);
    }

    return group;
  }

  // 3. SOFÁ MODULAR EN L (L-Sectional Sofa)
  function buildSofaModular(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 3.10;
    const d = item.depth || 2.20;
    const h = item.height || 0.82;
    const fabricColor = item.color || '#d0c8b8';

    const fabricMat = createMat(THREE, fabricColor, 0.85, 0.05);
    const cushionMat = createMat(THREE, fabricColor, 0.80, 0.05);
    const woodLegMat = createMat(THREE, '#3d2b1f', 0.4, 0.1);
    const accentPillowMat = createMat(THREE, '#424d5b', 0.8, 0.05);

    // Base Frame Main Section
    const baseW = w - 1.10;
    const baseD = 1.00;
    const baseH = 0.22;
    const baseMainGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const baseMain = new THREE.Mesh(baseMainGeo, fabricMat);
    baseMain.castShadow = true;
    baseMain.position.set(-w / 2 + baseW / 2, 0.18, -d / 2 + baseD / 2);
    group.add(baseMain);

    // Base Frame Chaise Longue Section
    const chaiseW = 1.10;
    const chaiseD = d;
    const baseChaiseGeo = new THREE.BoxGeometry(chaiseW, baseH, chaiseD);
    const baseChaise = new THREE.Mesh(baseChaiseGeo, fabricMat);
    baseChaise.castShadow = true;
    baseChaise.position.set(w / 2 - chaiseW / 2, 0.18, 0);
    group.add(baseChaise);

    // Cushions Main (2 thick comfortable seat cushions)
    const cWidth = (baseW - 0.06) / 2;
    for (let i = 0; i < 2; i++) {
      const cGeo = new THREE.BoxGeometry(cWidth - 0.02, 0.18, baseD - 0.15);
      const cushion = new THREE.Mesh(cGeo, cushionMat);
      cushion.castShadow = true;
      cushion.position.set(-w / 2 + 0.03 + (i + 0.5) * cWidth, 0.36, -d / 2 + baseD / 2 + 0.04);
      group.add(cushion);
    }

    // Chaise Seat Cushion
    const chaiseCushionGeo = new THREE.BoxGeometry(chaiseW - 0.06, 0.18, chaiseD - 0.18);
    const chaiseCushion = new THREE.Mesh(chaiseCushionGeo, cushionMat);
    chaiseCushion.castShadow = true;
    chaiseCushion.position.set(w / 2 - chaiseW / 2, 0.36, 0.05);
    group.add(chaiseCushion);

    // Backrest Main
    const backGeo = new THREE.BoxGeometry(w, 0.45, 0.22);
    const back = new THREE.Mesh(backGeo, fabricMat);
    back.castShadow = true;
    back.position.set(0, 0.52, -d / 2 + 0.11);
    group.add(back);

    // Armrest Left
    const armGeo = new THREE.BoxGeometry(0.24, 0.36, baseD);
    const arm = new THREE.Mesh(armGeo, fabricMat);
    arm.castShadow = true;
    arm.position.set(-w / 2 + 0.12, 0.44, -d / 2 + baseD / 2);
    group.add(arm);

    // Throw Pillows
    for (let p = 0; p < 3; p++) {
      const pillowGeo = new THREE.BoxGeometry(0.40, 0.38, 0.15);
      const pillow = new THREE.Mesh(pillowGeo, p === 1 ? accentPillowMat : cushionMat);
      pillow.castShadow = true;
      pillow.position.set(-w / 2 + 0.5 + p * 0.9, 0.50, -d / 2 + 0.28);
      pillow.rotation.y = (p - 1) * 0.15;
      pillow.rotation.x = 0.2;
      group.add(pillow);
    }

    // Tapered Wooden Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.10, 12);
    const legPositions = [
      [-w / 2 + 0.1, -d / 2 + 0.1],
      [w / 2 - 0.1, -d / 2 + 0.1],
      [-w / 2 + 0.1, -d / 2 + baseD - 0.1],
      [w / 2 - 0.1, d / 2 - 0.1],
      [w / 2 - chaiseW - 0.05, d / 2 - 0.1],
      [w / 2 - chaiseW - 0.05, -d / 2 + 0.1]
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodLegMat);
      leg.castShadow = true;
      leg.position.set(lx, 0.05, lz);
      group.add(leg);
    });

    return group;
  }

  // 4. SOFÁ LINEAL 3 CUERPOS
  function buildSofaThreeSeat(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.30;
    const d = item.depth || 0.95;
    const h = item.height || 0.82;
    const mat = createMat(THREE, item.color || '#4a5568', 0.85);

    // Base
    const baseGeo = new THREE.BoxGeometry(w, 0.22, d);
    const base = new THREE.Mesh(baseGeo, mat);
    base.castShadow = true;
    base.position.set(0, 0.18, 0);
    group.add(base);

    // 3 Cushions
    const cW = (w - 0.44) / 3;
    for (let i = 0; i < 3; i++) {
      const cGeo = new THREE.BoxGeometry(cW - 0.02, 0.18, d - 0.22);
      const c = new THREE.Mesh(cGeo, mat);
      c.castShadow = true;
      c.position.set(-w / 2 + 0.22 + (i + 0.5) * cW, 0.36, 0.08);
      group.add(c);
    }

    // Backrest
    const backGeo = new THREE.BoxGeometry(w, 0.45, 0.22);
    const back = new THREE.Mesh(backGeo, mat);
    back.castShadow = true;
    back.position.set(0, 0.52, -d / 2 + 0.11);
    group.add(back);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.20, 0.35, d);
    const armL = new THREE.Mesh(armGeo, mat);
    armL.castShadow = true;
    armL.position.set(-w / 2 + 0.1, 0.44, 0);
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, mat);
    armR.castShadow = true;
    armR.position.set(w / 2 - 0.1, 0.44, 0);
    group.add(armR);

    return group;
  }

  // 5. MESA DE CENTRO DE SALÓN
  function buildCoffeeTable(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 1.20;
    const d = item.depth || 0.70;
    const h = item.height || 0.42;

    const woodTexture = window.ArchTextures.getTexture(item.material || 'wood_walnut', THREE);
    const topMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.35 });
    const metalMat = createMat(THREE, '#1a1a1a', 0.25, 0.8);

    // Tabletop
    const topGeo = new THREE.BoxGeometry(w, 0.045, d);
    const top = new THREE.Mesh(topGeo, topMat);
    top.castShadow = true;
    top.receiveShadow = true;
    top.position.set(0, h - 0.022, 0);
    group.add(top);

    // Geometric Metal Legs
    const legGeo = new THREE.BoxGeometry(0.03, h - 0.045, 0.03);
    const corners = [
      [-w / 2 + 0.08, -d / 2 + 0.08],
      [w / 2 - 0.08, -d / 2 + 0.08],
      [-w / 2 + 0.08, d / 2 - 0.08],
      [w / 2 - 0.08, d / 2 - 0.08]
    ];
    corners.forEach(([cx, cz]) => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.castShadow = true;
      leg.position.set(cx, (h - 0.045) / 2, cz);
      group.add(leg);
    });

    return group;
  }

  // 6. CONSOLA DE TV CON SMART TV OLED 65"
  function buildTvUnit(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.20;
    const d = item.depth || 0.45;
    const h = item.height || 1.55;

    const woodTexture = window.ArchTextures.getTexture('wood_walnut', THREE);
    const credenzaMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.4 });
    const screenTexture = window.ArchTextures.getTexture('screen_oled', THREE);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const tvFrameMat = createMat(THREE, '#0a0a0a', 0.1, 0.9);

    // Credenza base cabinet
    const cabGeo = new THREE.BoxGeometry(w, 0.45, d);
    const cab = new THREE.Mesh(cabGeo, credenzaMat);
    cab.castShadow = true;
    cab.position.set(0, 0.25, 0);
    group.add(cab);

    // TV Stand / Frame
    const tvW = 1.45;
    const tvH = 0.85;
    const tvFrameGeo = new THREE.BoxGeometry(tvW, tvH, 0.03);
    const tvFrame = new THREE.Mesh(tvFrameGeo, tvFrameMat);
    tvFrame.position.set(0, 0.98, -0.05);
    tvFrame.castShadow = true;
    group.add(tvFrame);

    // OLED Glowing Screen Display
    const screenGeo = new THREE.PlaneGeometry(tvW - 0.04, tvH - 0.04);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.98, -0.034);
    group.add(screen);

    // Soundbar
    const barGeo = new THREE.BoxGeometry(0.85, 0.06, 0.08);
    const bar = new THREE.Mesh(barGeo, tvFrameMat);
    bar.castShadow = true;
    bar.position.set(0, 0.51, 0.06);
    group.add(bar);

    return group;
  }

  // 7. ISLA DE COCINA CON CASCADA DE CUARZO Y FREGADERO
  function buildKitchenIsland(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.80;
    const d = item.depth || 1.10;
    const h = item.height || 0.92;

    const marbleTexture = window.ArchTextures.getTexture('marble_carrara', THREE);
    const quartzMat = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.15,
      metalness: 0.05
    });
    const cabinetMat = createMat(THREE, '#242b35', 0.4, 0.1);
    const chromeMat = createMat(THREE, '#e5e7eb', 0.1, 0.9);

    // Main Countertop Top
    const topGeo = new THREE.BoxGeometry(w, 0.07, d);
    const top = new THREE.Mesh(topGeo, quartzMat);
    top.castShadow = true;
    top.position.set(0, h - 0.035, 0);
    group.add(top);

    // Quartz Waterfall Sides
    const waterfallGeo = new THREE.BoxGeometry(0.07, h - 0.07, d);
    const waterfallL = new THREE.Mesh(waterfallGeo, quartzMat);
    waterfallL.castShadow = true;
    waterfallL.position.set(-w / 2 + 0.035, (h - 0.07) / 2, 0);
    group.add(waterfallL);

    const waterfallR = new THREE.Mesh(waterfallGeo, quartzMat);
    waterfallR.castShadow = true;
    waterfallR.position.set(w / 2 - 0.035, (h - 0.07) / 2, 0);
    group.add(waterfallR);

    // Dark Cabinetry Body
    const cabGeo = new THREE.BoxGeometry(w - 0.16, h - 0.14, d * 0.75);
    const cab = new THREE.Mesh(cabGeo, cabinetMat);
    cab.castShadow = true;
    cab.position.set(0, (h - 0.14) / 2, -d * 0.1);
    group.add(cab);

    // Stainless Steel Undermount Sink
    const sinkGeo = new THREE.BoxGeometry(0.65, 0.02, 0.42);
    const sink = new THREE.Mesh(sinkGeo, chromeMat);
    sink.position.set(-0.4, h + 0.002, 0.0);
    group.add(sink);

    // Gooseneck Designer Faucet
    const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), chromeMat);
    faucetStem.position.set(-0.4, h + 0.18, -0.22);
    group.add(faucetStem);

    const faucetSpout = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 12, 24, Math.PI), chromeMat);
    faucetSpout.rotation.z = Math.PI;
    faucetSpout.rotation.y = Math.PI / 2;
    faucetSpout.position.set(-0.4, h + 0.35, -0.10);
    group.add(faucetSpout);

    // Bar Stools
    for (let s = 0; s < 2; s++) {
      const stool = new THREE.Group();
      const stoolMat = createMat(THREE, '#1a1a1a', 0.3, 0.7);
      const cushionMat = createMat(THREE, '#c49a6c', 0.5, 0.1);

      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24), cushionMat);
      seat.position.set(0, 0.68, 0);
      stool.add(seat);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 16), stoolMat);
      pole.position.set(0, 0.33, 0);
      stool.add(pole);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), stoolMat);
      base.position.set(0, 0.01, 0);
      stool.add(base);

      stool.position.set(-0.5 + s * 1.0, 0, d / 2 + 0.25);
      group.add(stool);
    }

    return group;
  }

  // 8. MESA DE COMEDOR CON 6-8 SILLAS
  function buildDiningTable(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.20;
    const d = item.depth || 1.00;
    const h = item.height || 0.76;

    const woodTexture = window.ArchTextures.getTexture(item.material || 'wood_oak', THREE);
    const tableMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.35 });
    const metalMat = createMat(THREE, '#1f232b', 0.3, 0.7);

    // Tabletop
    const topGeo = new THREE.BoxGeometry(w, 0.05, d);
    const top = new THREE.Mesh(topGeo, tableMat);
    top.castShadow = true;
    top.receiveShadow = true;
    top.position.set(0, h - 0.025, 0);
    group.add(top);

    // U-shaped Metal Legs
    for (let side of [-1, 1]) {
      const legFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, h - 0.05, d * 0.85), metalMat);
      legFrame.castShadow = true;
      legFrame.position.set(side * (w / 2 - 0.25), (h - 0.05) / 2, 0);
      group.add(legFrame);
    }

    // 6 Scandinavian Chairs
    const chairMat = createMat(THREE, '#e5e0d8', 0.7, 0.05);
    const chairLegMat = createMat(THREE, '#3d2b1f', 0.4, 0.1);

    for (let c = 0; c < 3; c++) {
      const posX = -w / 3 + c * (w / 3);
      for (let side of [-1, 1]) {
        const chair = new THREE.Group();

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.44), chairMat);
        seat.position.set(0, 0.45, 0);
        seat.castShadow = true;
        chair.add(seat);

        // Curved back
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.03), chairMat);
        back.position.set(0, 0.65, side * -0.20);
        back.castShadow = true;
        chair.add(back);

        // 4 Legs
        for (let lx of [-0.18, 0.18]) {
          for (let lz of [-0.18, 0.18]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, 0.45, 12), chairLegMat);
            leg.position.set(lx, 0.225, lz);
            chair.add(leg);
          }
        }

        chair.position.set(posX, 0, side * (d / 2 + 0.32));
        chair.rotation.y = side === 1 ? Math.PI : 0;
        group.add(chair);
      }
    }

    return group;
  }

  // 9. CAMA KING SIZE CON CABECERO Y MESITAS
  function buildBedKing(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.10;
    const d = item.depth || 2.20;
    const h = item.height || 1.15;

    const headboardMat = createMat(THREE, item.color || '#343c4a', 0.85);
    const mattressMat = createMat(THREE, '#ffffff', 0.9, 0.0);
    const duvetMat = createMat(THREE, '#f3ede2', 0.85, 0.0);
    const pillowMat = createMat(THREE, '#ffffff', 0.9, 0.0);
    const woodMat = createMat(THREE, '#c49a6c', 0.4, 0.1);

    // Bed Frame Base
    const frameGeo = new THREE.BoxGeometry(w, 0.25, d);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.castShadow = true;
    frame.position.set(0, 0.18, 0);
    group.add(frame);

    // Padded Headboard
    const headGeo = new THREE.BoxGeometry(w + 0.2, h, 0.18);
    const head = new THREE.Mesh(headGeo, headboardMat);
    head.castShadow = true;
    head.position.set(0, h / 2, -d / 2 + 0.09);
    group.add(head);

    // Mattress
    const matGeo = new THREE.BoxGeometry(w - 0.1, 0.28, d - 0.2);
    const mat = new THREE.Mesh(matGeo, mattressMat);
    mat.castShadow = true;
    mat.position.set(0, 0.42, 0.08);
    group.add(mat);

    // Duvet
    const duvetGeo = new THREE.BoxGeometry(w - 0.08, 0.16, d * 0.72);
    const duvet = new THREE.Mesh(duvetGeo, duvetMat);
    duvet.castShadow = true;
    duvet.position.set(0, 0.50, 0.22);
    group.add(duvet);

    // 4 Soft Pillows
    for (let row = 0; row < 2; row++) {
      for (let side of [-1, 1]) {
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.42), pillowMat);
        pillow.castShadow = true;
        pillow.position.set(side * 0.48, 0.52 + row * 0.08, -d / 2 + 0.45 + row * 0.22);
        pillow.rotation.x = 0.25;
        group.add(pillow);
      }
    }

    return group;
  }

  // 10. MUEBLE DE TOCADOR LAVABO CON ESPEJO LED
  function buildVanity(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 1.50;
    const d = item.depth || 0.52;
    const h = item.height || 1.70;

    const woodTexture = window.ArchTextures.getTexture('wood_walnut', THREE);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.4 });
    const basinMat = createMat(THREE, '#ffffff', 0.15, 0.05);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.95
    });

    // Floating Cabinet Base
    const cabGeo = new THREE.BoxGeometry(w, 0.42, d);
    const cab = new THREE.Mesh(cabGeo, woodMat);
    cab.castShadow = true;
    cab.position.set(0, 0.60, 0);
    group.add(cab);

    // Ceramic Vessel Sinks
    const sinksCount = w > 1.2 ? 2 : 1;
    for (let s = 0; s < sinksCount; s++) {
      const sx = sinksCount === 1 ? 0 : (s === 0 ? -w / 4 : w / 4);
      const sink = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.14, 24), basinMat);
      sink.castShadow = true;
      sink.position.set(sx, 0.88, 0);
      group.add(sink);
    }

    // Circular or Pill Mirror with LED Halo Backlight
    const mirrorGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.02, 32);
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.rotation.x = Math.PI / 2;
    mirror.position.set(0, 1.35, -d / 2 + 0.02);
    group.add(mirror);

    // Glowing LED Ring
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x90e0ef });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.015, 16, 32), haloMat);
    halo.position.set(0, 1.35, -d / 2 + 0.01);
    group.add(halo);

    return group;
  }

  // 11. BAÑERA EXENTA OVALADA
  function buildBathtub(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 1.75;
    const d = item.depth || 0.85;
    const h = item.height || 0.60;

    const tubMat = createMat(THREE, '#fdfdfd', 0.15, 0.05);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x00b4d8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      transmission: 0.8
    });

    // Tub Outer Shell
    const tubGeo = new THREE.CylinderGeometry(w / 2, w / 2 * 0.8, h, 32);
    tubGeo.scale(1, 1, d / w);
    const tub = new THREE.Mesh(tubGeo, tubMat);
    tub.castShadow = true;
    tub.position.set(0, h / 2, 0);
    group.add(tub);

    // Water Surface
    const waterGeo = new THREE.CylinderGeometry(w / 2 * 0.9, w / 2 * 0.9, 0.02, 32);
    waterGeo.scale(1, 1, d / w);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, h * 0.85, 0);
    group.add(water);

    // Floor Spout Faucet
    const faucetMat = createMat(THREE, '#1a1a1a', 0.2, 0.8);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85), faucetMat);
    spout.position.set(w / 2 + 0.1, 0.42, 0);
    group.add(spout);

    return group;
  }

  // 12. PLANTA MONSTERA EN MACETA CERÁMICA
  function buildPlant(item, THREE) {
    const group = new THREE.Group();
    const potMat = createMat(THREE, '#f8f9fa', 0.3, 0.05);
    const soilMat = createMat(THREE, '#3d2817', 0.9, 0.0);
    const leafMat = createMat(THREE, '#2d6a4f', 0.6, 0.05);

    // Ceramic Planter Pot
    const potGeo = new THREE.CylinderGeometry(0.25, 0.20, 0.45, 24);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.castShadow = true;
    pot.position.set(0, 0.25, 0);
    group.add(pot);

    // Soil
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24), soilMat);
    soil.position.set(0, 0.46, 0);
    group.add(soil);

    // Lush Fan of Monstera Leaves
    const leafGeo = new THREE.PlaneGeometry(0.35, 0.50);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 9) * Math.PI * 2;
      const radius = 0.12;
      leaf.position.set(Math.cos(angle) * radius, 0.55 + (i % 3) * 0.2, Math.sin(angle) * radius);
      leaf.rotation.x = 0.5 + (i % 2) * 0.2;
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      group.add(leaf);
    }

    return group;
  }

  // 13. LÁMPARA DE ARCO CON FOCO CÁLIDO
  function buildLampArc(item, THREE) {
    const group = new THREE.Group();
    const metalMat = createMat(THREE, '#d4af37', 0.2, 0.85);
    const shadeMat = createMat(THREE, '#f8f9fa', 0.3, 0.1);

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), metalMat);
    base.castShadow = true;
    base.position.set(0, 0.03, 0);
    group.add(base);

    // Curved Arc
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.06, 0),
      new THREE.Vector3(0, 2.3, 0.2),
      new THREE.Vector3(0, 2.1, 1.2)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.018, 12, false);
    const tube = new THREE.Mesh(tubeGeo, metalMat);
    tube.castShadow = true;
    group.add(tube);

    // Dome Shade
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.20, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), shadeMat);
    shade.position.set(0, 2.05, 1.2);
    shade.rotation.x = Math.PI;
    group.add(shade);

    // Warm Interior Point Light
    const light = new THREE.PointLight(0xffecb3, 1.2, 6.0);
    light.position.set(0, 1.95, 1.2);
    light.castShadow = true;
    light.shadow.bias = -0.002;
    group.add(light);

    return group;
  }

  // 14. LÁMPARA COLGANTE DE COMEDOR
  function buildPendantLight(item, THREE) {
    const group = new THREE.Group();
    const goldMat = createMat(THREE, '#d4af37', 0.2, 0.85);
    const cordMat = createMat(THREE, '#1a1a1a', 0.5, 0.2);

    const w = item.width || 1.40;
    const count = 3;
    for (let i = 0; i < count; i++) {
      const px = -w / 2 + (i + 0.5) * (w / count);

      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.8), cordMat);
      cord.position.set(px, 0.4, 0);
      group.add(cord);

      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.28, 24), goldMat);
      shade.position.set(px, 0.0, 0);
      shade.castShadow = true;
      group.add(shade);

      const ptLight = new THREE.PointLight(0xfff1cc, 0.9, 4.0);
      ptLight.position.set(px, -0.15, 0);
      group.add(ptLight);
    }

    return group;
  }

  // 15. PUERTAS Y VENTANAS
  function buildDoor(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 0.90;
    const h = item.height || 2.10;
    const d = item.depth || 0.18;

    const frameMat = createMat(THREE, '#242933', 0.4, 0.1);
    const woodTexture = window.ArchTextures.getTexture('wood_walnut', THREE);
    const leafMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.35 });
    const handleMat = createMat(THREE, '#d4af37', 0.2, 0.9);

    const frameGeo = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, h / 2, 0);
    group.add(frame);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.10, h - 0.06, 0.05), leafMat);
    doorLeaf.castShadow = true;
    doorLeaf.position.set(0, h / 2, 0);
    group.add(doorLeaf);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.08), handleMat);
    handle.position.set(w / 2 - 0.15, 1.05, 0.04);
    group.add(handle);

    return group;
  }

  function buildWindow(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 2.40;
    const h = item.height || 1.50;
    const d = item.depth || 0.18;

    const frameMat = createMat(THREE, '#1a1d24', 0.3, 0.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbde0fe,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.95
    });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    frame.position.set(0, h / 2, 0);
    group.add(frame);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, h - 0.12, 0.02), glassMat);
    glass.position.set(0, h / 2, 0);
    group.add(glass);

    return group;
  }

  // 16. Área de Zacate / Jardín Exterior
  function buildGrassArea(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 4.0;
    const d = item.depth || 3.0;
    const h = item.height || 0.06;

    const grassTex = window.ArchTextures.getTexture('grass_emerald', THREE);
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.95,
      metalness: 0.0
    });
    const borderMat = createMat(THREE, '#475569', 0.8, 0.1);

    // Main turf slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), grassMat);
    slab.receiveShadow = true;
    slab.position.set(0, h / 2, 0);
    group.add(slab);

    // Stone / metal subtle garden curb border
    const curbThick = 0.04;
    const curbH = h + 0.02;
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(curbThick, curbH, d + curbThick * 2), borderMat);
    curbL.position.set(-w / 2 - curbThick / 2, curbH / 2, 0);
    group.add(curbL);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(curbThick, curbH, d + curbThick * 2), borderMat);
    curbR.position.set(w / 2 + curbThick / 2, curbH / 2, 0);
    group.add(curbR);
    const curbF = new THREE.Mesh(new THREE.BoxGeometry(w, curbH, curbThick), borderMat);
    curbF.position.set(0, curbH / 2, d / 2 + curbThick / 2);
    group.add(curbF);
    const curbB = new THREE.Mesh(new THREE.BoxGeometry(w, curbH, curbThick), borderMat);
    curbB.position.set(0, curbH / 2, -d / 2 - curbThick / 2);
    group.add(curbB);

    return group;
  }

  // 17. Constructor de Modelos Personalizados desde JSON
  function buildCustomJsonModel(item, THREE) {
    const group = new THREE.Group();
    const components = item.components || [];

    if (components.length === 0) {
      return buildGenericBox(item, THREE);
    }

    components.forEach(comp => {
      let geo = null;
      if (comp.type === 'box') {
        geo = new THREE.BoxGeometry(comp.w || 0.5, comp.h || 0.5, comp.d || 0.5);
      } else if (comp.type === 'cylinder') {
        geo = new THREE.CylinderGeometry(comp.r || 0.2, comp.r || 0.2, comp.h || 0.5, 24);
      } else if (comp.type === 'sphere') {
        geo = new THREE.SphereGeometry(comp.r || 0.25, 24, 16);
      } else {
        geo = new THREE.BoxGeometry(comp.w || 0.4, comp.h || 0.4, comp.d || 0.4);
      }

      const mat = createMat(THREE, comp.color || item.color || '#64748b', comp.roughness || 0.5, comp.metalness || 0.1);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(comp.x || 0, comp.y || 0, comp.z || 0);
      if (comp.rotX) mesh.rotation.x = comp.rotX;
      if (comp.rotY) mesh.rotation.y = comp.rotY;
      if (comp.rotZ) mesh.rotation.z = comp.rotZ;

      group.add(mesh);
    });

    return group;
  }

  // 18. Fallback generic box builder
  function buildGenericBox(item, THREE) {
    const group = new THREE.Group();
    const w = item.width || 1.0;
    const d = item.depth || 1.0;
    const h = item.height || 0.8;
    const mat = createMat(THREE, item.color || '#8c9298', 0.5, 0.1);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(0, h / 2, 0);
    group.add(mesh);
    return group;
  }

  // Public Registry
  return {
    buildItem: function(item, THREE) {
      if (!THREE) return null;
      let model = null;

      // Check if custom JSON model
      if (item.components && Array.isArray(item.components)) {
        model = buildCustomJsonModel(item, THREE);
      } else {
        switch (item.catalogId) {
          case 'area_grass_garden':
          case 'area_grass_backyard': model = buildGrassArea(item, THREE); break;
          case 'stair_straight': model = buildStairStraight(item, THREE); break;
          case 'stair_l_shape': model = buildStairLShape(item, THREE); break;
          case 'sofa_sectional_l': model = buildSofaModular(item, THREE); break;
          case 'sofa_three_seat': model = buildSofaThreeSeat(item, THREE); break;
          case 'coffee_table_set': model = buildCoffeeTable(item, THREE); break;
          case 'tv_unit_oled': model = buildTvUnit(item, THREE); break;
          case 'kitchen_island_sink': model = buildKitchenIsland(item, THREE); break;
          case 'dining_table_wood': model = buildDiningTable(item, THREE); break;
          case 'bed_king_suite': model = buildBedKing(item, THREE); break;
          case 'vanity_floating_double': model = buildVanity(item, THREE); break;
          case 'bathtub_freestanding': model = buildBathtub(item, THREE); break;
          case 'plant_monstera': model = buildPlant(item, THREE); break;
          case 'lamp_arc_floor': model = buildLampArc(item, THREE); break;
          case 'pendant_light_dining': model = buildPendantLight(item, THREE); break;
          case 'door_entry':
          case 'door_interior': model = buildDoor(item, THREE); break;
          case 'door_sliding_glass':
          case 'window_panoramic':
          case 'window_standard': model = buildWindow(item, THREE); break;
          default:
            if (item.isCustomModel) {
              model = buildCustomJsonModel(item, THREE);
            } else {
              model = buildGenericBox(item, THREE);
            }
            break;
        }
      }

      if (model) {
        model.name = item.id;
        model.userData = { itemId: item.id };

        // Support horizontal and vertical mirroring / flipping
        const scaleX = item.flipX ? -1 : 1;
        const scaleZ = item.flipY ? -1 : 1;
        model.scale.set(scaleX, 1, scaleZ);
      }
      return model;
    }
  };
})();
