/**
 * ARCHITECT STUDIO 3D - 3D BIM & Architectural Scene Engine
 * High-performance Three.js engine with realistic PBR textures, soft shadows,
 * multi-floor stacking, cutaway wall slicing & interactive raycasting selection
 */

window.ArchRenderer3D = (function() {
  let container;
  let scene, camera, renderer, controls;
  let sunLight, ambientLight, hemiLight;
  let interiorLights = [];
  
  // Object groups
  let floorsGroup, wallsGroup, itemsGroup, helpersGroup;
  
  // Interactive Raycasting & 3D Dragging
  let raycaster, mouse;
  let isDragging3D = false;
  let draggedItem = null;
  let dragPlane = null;
  let dragPlaneIntersect = null;
  let dragOffset = null;
  let selectionBoxHelper = null;

  // Camera presets
  const CAM_PRESETS = {
    orbit: { pos: [14, 12, 16], target: [6, 1.5, 4] },
    iso: { pos: [18, 16, 18], target: [6, 1, 4] },
    top: { pos: [6, 22, 4], target: [6, 0, 4.01] },
    fpv: { pos: [4, 1.6, 3], target: [8, 1.4, 3] }
  };

  function init(containerElement) {
    container = containerElement;
    if (!window.THREE) {
      console.error("Three.js is not loaded yet.");
      return;
    }

    const THREE = window.THREE;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19'); // Deep architectural slate

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(14, 12, 16);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for HD screenshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    if (window.THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI / 2 - 0.01; // Do not go under ground
      controls.minDistance = 2;
      controls.maxDistance = 60;
      controls.target.set(6, 1.5, 4);
      controls.update();
    }

    // 5. Lighting Setup
    setupLighting(THREE);

    // 6. Ground & Foundation Grid
    setupGround(THREE);

    // 7. Groups
    floorsGroup = new THREE.Group();
    wallsGroup = new THREE.Group();
    itemsGroup = new THREE.Group();
    helpersGroup = new THREE.Group();

    scene.add(floorsGroup);
    scene.add(wallsGroup);
    scene.add(itemsGroup);
    scene.add(helpersGroup);

    // 8. Raycaster & Plane
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    dragPlaneIntersect = new THREE.Vector3();
    dragOffset = new THREE.Vector3();

    // 9. Events
    setupEvents();

    // 10. Initial Build & Animation Loop
    rebuildScene();
    animate();
  }

  // Lighting Setup with Day / Sunset / Night presets
  function setupLighting(THREE) {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x475569, 0.6);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    sunLight.position.set(16, 24, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);
  }

  function setLightingTime(time) {
    if (!sunLight || !ambientLight) return;
    const THREE = window.THREE;

    if (time === 'sunset') {
      scene.background.set('#1c131a');
      ambientLight.color.set('#ffd1b3');
      ambientLight.intensity = 0.5;
      hemiLight.color.set('#ff9e7d');
      hemiLight.groundColor.set('#3a1e2b');
      sunLight.color.set('#ff7b00');
      sunLight.intensity = 1.9;
      sunLight.position.set(22, 8, 14);
    } else if (time === 'night') {
      scene.background.set('#060911');
      ambientLight.color.set('#2d3748');
      ambientLight.intensity = 0.25;
      hemiLight.color.set('#1a202c');
      hemiLight.groundColor.set('#0a0d14');
      sunLight.color.set('#4a5568');
      sunLight.intensity = 0.2;
      sunLight.position.set(10, 15, 10);
    } else {
      // Day
      scene.background.set('#0b0f19');
      ambientLight.color.set('#ffffff');
      ambientLight.intensity = 0.75;
      hemiLight.color.set('#e2e8f0');
      hemiLight.groundColor.set('#475569');
      sunLight.color.set('#fff5e6');
      sunLight.intensity = 1.6;
      sunLight.position.set(16, 24, 12);
    }
  }

  // Foundation Ground & Exterior Turf
  function setupGround(THREE) {
    // Vast outer yard / ground
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Architectural Grid Helper on ground
    const grid = new THREE.GridHelper(30, 30, 0x00d2ff, 0x1e293b);
    grid.position.set(6, -0.04, 4);
    scene.add(grid);
  }

  // Full Scene Rebuild from State
  function rebuildScene() {
    if (!scene || !window.THREE) return;
    const THREE = window.THREE;
    const state = window.ArchState.getState();

    // 1. Clear previous dynamic meshes
    clearGroup(floorsGroup);
    clearGroup(wallsGroup);
    clearGroup(itemsGroup);
    clearGroup(helpersGroup);
    interiorLights = [];

    // 2. Build Floor Slabs & Rooms
    buildFloorsAndRooms(THREE, state);

    // 3. Build Architectural Walls
    buildWalls(THREE, state);

    // 4. Build Furniture & Utensils
    buildItems(THREE, state);

    // 5. Update Selection Visuals
    updateSelectionHelper(state);
  }

  function clearGroup(group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }

  // Build Floors and Room Slabs
  function buildFloorsAndRooms(THREE, state) {
    state.floors.forEach(floor => {
      if (!floor.visible) return;

      const floorElev = floor.elevation || 0.0;
      const rooms = state.rooms.filter(r => r.floorId === floor.id);

      // Build each room's floor finish
      rooms.forEach(room => {
        const rw = room.width;
        const rd = room.depth;
        const slabGeo = new THREE.BoxGeometry(rw, 0.12, rd);

        // Floor texture
        const tex = window.ArchTextures.getTexture(room.floorMaterial || floor.floorMaterial || 'wood_oak', THREE);
        const slabMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.35,
          metalness: 0.05
        });

        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.receiveShadow = true;
        slab.position.set(room.x + rw / 2, floorElev - 0.06, room.y + rd / 2);
        slab.userData = { roomId: room.id, floorId: floor.id };
        floorsGroup.add(slab);
      });

      // If active floor is floor_1 (upper) and lower floor is visible, add ceiling slab
      if (floor.order > 0) {
        const underCeilingGeo = new THREE.BoxGeometry(12.2, 0.14, 7.8);
        const underCeilingMat = new THREE.MeshStandardMaterial({
          color: 0x242830,
          roughness: 0.8
        });
        const underCeiling = new THREE.Mesh(underCeilingGeo, underCeilingMat);
        underCeiling.position.set(6.0, floorElev - 0.13, 3.8);
        underCeiling.receiveShadow = true;
        floorsGroup.add(underCeiling);
      }
    });
  }

  // Build Architectural 3D Extruded Walls
  function buildWalls(THREE, state) {
    const wallHeight = state.wallCutaway
      ? window.ARCH_CONSTANTS.CUTAWAY_WALL_HEIGHT
      : window.ARCH_CONSTANTS.DEFAULT_WALL_HEIGHT;

    state.floors.forEach(floor => {
      if (!floor.visible) return;
      const floorElev = floor.elevation || 0.0;
      const walls = state.walls.filter(w => w.floorId === floor.id);

      walls.forEach(w => {
        const dx = w.x2 - w.x1;
        const dy = w.y2 - w.y1;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const thickness = w.thickness || 0.18;

        const wallGeo = new THREE.BoxGeometry(len, wallHeight, thickness);
        const wallMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(w.color || floor.wallColor || '#EDE8DF'),
          roughness: 0.85,
          metalness: 0.02
        });

        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;

        // Position: midpoint
        const midX = (w.x1 + w.x2) / 2;
        const midZ = (w.y1 + w.y2) / 2;
        wallMesh.position.set(midX, floorElev + wallHeight / 2, midZ);
        wallMesh.rotation.y = -angle;
        wallMesh.userData = { wallId: w.id, floorId: floor.id };

        wallsGroup.add(wallMesh);

        // Wall Top Cap (Elegante remate oscuro arquitectónico en corte)
        if (state.wallCutaway) {
          const capGeo = new THREE.BoxGeometry(len + 0.02, 0.02, thickness + 0.02);
          const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.position.set(midX, floorElev + wallHeight + 0.01, midZ);
          cap.rotation.y = -angle;
          wallsGroup.add(cap);
        }
      });
    });
  }

  // Build Furniture & Utensils
  function buildItems(THREE, state) {
    state.floors.forEach(floor => {
      if (!floor.visible) return;
      const floorElev = floor.elevation || 0.0;
      const items = state.items.filter(it => it.floorId === floor.id);

      items.forEach(item => {
        const model = window.ArchModels.buildItem(item, THREE);
        if (model) {
          model.position.set(item.x, floorElev + (item.z || 0.0), item.y);
          model.rotation.y = -(item.rotation || 0) * (Math.PI / 180);
          model.userData = { itemId: item.id, floorId: floor.id };

          // Traverse to ensure shadow casting
          model.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData = { itemId: item.id };
            }
          });

          itemsGroup.add(model);
        }
      });
    });
  }

  // Selection Bounding Box Helper
  function updateSelectionHelper(state) {
    if (!helpersGroup || !window.THREE) return;
    const THREE = window.THREE;
    clearGroup(helpersGroup);

    if (!state.selectedId || state.selectedType !== 'item') return;

    // Find the 3D object
    let selectedObj = null;
    itemsGroup.traverse(child => {
      if (child.userData?.itemId === state.selectedId && child.isGroup) {
        selectedObj = child;
      }
    });

    if (selectedObj) {
      const box = new THREE.Box3().setFromObject(selectedObj);
      const helper = new THREE.Box3Helper(box, 0x00d2ff);
      helper.material.linewidth = 2;
      helpersGroup.add(helper);

      // Add a small rotation ring around the object
      const item = state.items.find(it => it.id === state.selectedId);
      if (item) {
        const ringRadius = Math.max(item.width, item.depth) * 0.75;
        const ringGeo = new THREE.RingGeometry(ringRadius - 0.04, ringRadius, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(item.x, selectedObj.position.y + 0.02, item.y);
        helpersGroup.add(ring);
      }
    }
  }

  // Interactive Events (Raycast Selection & 3D Drag)
  function setupEvents() {
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);
  }

  function getPointerPos(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      clientX: e.clientX,
      clientY: e.clientY
    };
  }

  function onPointerDown(e) {
    if (e.button !== 0) return; // Only primary button
    const p = getPointerPos(e);
    mouse.x = p.x;
    mouse.y = p.y;

    raycaster.setFromCamera(mouse, camera);

    // Raycast against items
    const intersects = raycaster.intersectObjects(itemsGroup.children, true);
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData?.itemId && hitObj.parent) {
        hitObj = hitObj.parent;
      }

      const itemId = hitObj?.userData?.itemId;
      if (itemId) {
        const state = window.ArchState.getState();
        window.ArchState.select(itemId, 'item');

        const item = state.items.find(it => it.id === itemId);
        if (item && !item.locked) {
          isDragging3D = true;
          draggedItem = item;
          controls.enabled = false; // Temporarily disable orbit controls

          // Configure floor intersection plane
          const floor = state.floors.find(f => f.id === item.floorId) || state.floors[0];
          dragPlane.constant = -(floor.elevation || 0);

          if (raycaster.ray.intersectPlane(dragPlane, dragPlaneIntersect)) {
            dragOffset.set(item.x - dragPlaneIntersect.x, 0, item.y - dragPlaneIntersect.z);
          }
        }
        return;
      }
    }

    // If clicked empty space, deselect
    window.ArchState.deselect();
  }

  function onPointerMove(e) {
    const p = getPointerPos(e);
    mouse.x = p.x;
    mouse.y = p.y;

    if (isDragging3D && draggedItem) {
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(dragPlane, dragPlaneIntersect)) {
        const state = window.ArchState.getState();
        let newX = dragPlaneIntersect.x + dragOffset.x;
        let newZ = dragPlaneIntersect.z + dragOffset.z;

        if (state.gridSnap) {
          newX = Math.round(newX / state.gridSnap) * state.gridSnap;
          newZ = Math.round(newZ / state.gridSnap) * state.gridSnap;
        }

        draggedItem.x = parseFloat(newX.toFixed(2));
        draggedItem.y = parseFloat(newZ.toFixed(2));
        window.ArchState.updateItem(draggedItem.id, { x: draggedItem.x, y: draggedItem.y }, false);
        rebuildScene();
      }
    }
  }

  function onPointerUp() {
    if (isDragging3D) {
      isDragging3D = false;
      draggedItem = null;
      if (controls) controls.enabled = true;
    }
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // Camera Presets
  function setCameraPreset(presetName) {
    const p = CAM_PRESETS[presetName] || CAM_PRESETS.orbit;
    if (camera && controls) {
      camera.position.set(...p.pos);
      controls.target.set(...p.target);
      controls.update();
    }
  }

  // Render & Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Public API
  return {
    init,
    rebuildScene,
    updateSelection: () => updateSelectionHelper(window.ArchState.getState()),
    setLightingTime,
    setCameraPreset,
    resize: onResize,
    getCanvas: () => renderer?.domElement,
    captureHD: () => {
      if (!renderer || !scene || !camera) return null;
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    }
  };
})();
