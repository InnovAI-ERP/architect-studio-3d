/**
 * ARCHITECT STUDIO 3D - Constants & Catalog Definitions
 * High-End BIM & Interior Architecture Engine
 */

window.ARCH_CONSTANTS = {
  APP_NAME: "ARCHITECT STUDIO 3D",
  VERSION: "2.4.0",
  GRID_MAJOR: 1.0, // Major grid lines every 1.0m
  GRID_MINOR: 0.25, // Minor grid lines every 0.25m
  DEFAULT_WALL_HEIGHT: 2.80, // Default wall height in meters
  DEFAULT_WALL_THICKNESS: 0.18, // Wall thickness in meters
  CUTAWAY_WALL_HEIGHT: 1.10, // Cutaway sectional wall height in meters
  FLOOR_HEIGHT: 2.80, // Level separation in meters
  
  // Floor Finish Materials
  MATERIALS: [
    { id: 'wood_oak', name: 'Roble Natural Nórdico', category: 'Madera', color: '#c49a6c', roughness: 0.45, metalness: 0.05 },
    { id: 'wood_walnut', name: 'Nogal Americano Oscuro', category: 'Madera', color: '#5c4033', roughness: 0.40, metalness: 0.05 },
    { id: 'marble_carrara', name: 'Mármol Blanco Carrara', category: 'Piedra', color: '#f0f0f2', roughness: 0.15, metalness: 0.10 },
    { id: 'concrete_polished', name: 'Concreto Arquitectónico', category: 'Concreto', color: '#8c9298', roughness: 0.60, metalness: 0.02 },
    { id: 'tile_chevron', name: 'Porcelanato Chevron', category: 'Cerámica', color: '#e5dec9', roughness: 0.35, metalness: 0.05 },
    { id: 'tile_slate', name: 'Pizarra Gris Grafito', category: 'Piedra', color: '#32373e', roughness: 0.50, metalness: 0.08 },
    { id: 'deck_teak', name: 'Deck Madera Teca Exterior', category: 'Exterior', color: '#a06a3b', roughness: 0.65, metalness: 0.02 },
    { id: 'grass_emerald', name: 'Césped Natural Esmeralda', category: 'Exterior', color: '#3d7a36', roughness: 0.90, metalness: 0.00 }
  ],

  // Wall Colors / Finishes
  WALL_COLORS: [
    { id: 'pure_white', name: 'Blanco Puro Calacatta', hex: '#F8F9FA' },
    { id: 'warm_linen', name: 'Lino Cálido Escandinavo', hex: '#EDE8DF' },
    { id: 'sand_dune', name: 'Arena Tostada Suave', hex: '#D6C7B2' },
    { id: 'concrete_gray', name: 'Gris Cemento Neutro', hex: '#9EACB5' },
    { id: 'deep_slate', name: 'Grafito Arquitectónico', hex: '#2B323D' },
    { id: 'nordic_sage', name: 'Verde Salvia Nórdico', hex: '#7E8F7C' },
    { id: 'terracotta', name: 'Terracota Mediterránea', hex: '#C26A51' },
    { id: 'navy_accent', name: 'Azul Marino Profundo', hex: '#1E293B' }
  ],

  // Full Catalog of Architectural Elements, Furniture, Utensils and Fixtures
  CATALOG: [
    // 🏛️ ARQUITECTURA & CONEXIÓN
    {
      id: 'stair_straight',
      name: 'Escalera Recta de Roble y Cristal',
      category: 'architecture',
      icon: 'stairs',
      width: 1.10,
      depth: 3.60,
      height: 2.80,
      elevation: 0.0,
      color: '#c49a6c',
      metalColor: '#e0e0e0',
      description: 'Escalera recta moderna de 16 peldaños volados en roble con barandilla de cristal templado y pasamanos de acero.',
      isStair: true
    },
    {
      id: 'stair_l_shape',
      name: 'Escalera en L con Descanso',
      category: 'architecture',
      icon: 'corner-down-right',
      width: 2.20,
      depth: 2.60,
      height: 2.80,
      elevation: 0.0,
      color: '#c49a6c',
      metalColor: '#2b2b2b',
      description: 'Escalera en L con descanso intermedio a 1.40m, peldaños de madera maciza y barandilla minimalista negra.',
      isStair: true
    },
    {
      id: 'stair_spiral',
      name: 'Escalera Caracol Helicoidal',
      category: 'architecture',
      icon: 'rotate-cw',
      width: 1.80,
      depth: 1.80,
      height: 2.80,
      elevation: 0.0,
      color: '#2b323d',
      metalColor: '#c49a6c',
      description: 'Escalera helicoidal escultórica con mástil central y peldaños radiales de diseño contemporáneo.',
      isStair: true
    },
    {
      id: 'door_entry',
      name: 'Puerta Principal Pivotante de Madera',
      category: 'architecture',
      icon: 'door-closed',
      width: 1.20,
      depth: 0.18,
      height: 2.40,
      elevation: 0.0,
      color: '#5c4033',
      metalColor: '#1a1a1a',
      isOpening: true,
      description: 'Puerta exterior de seguridad pivotante en madera de nogal con tirador vertical alargado.'
    },
    {
      id: 'door_interior',
      name: 'Puerta Interior de Paso con Marco',
      category: 'architecture',
      icon: 'door-open',
      width: 0.90,
      depth: 0.18,
      height: 2.10,
      elevation: 0.0,
      color: '#f8f9fa',
      metalColor: '#777777',
      isOpening: true,
      description: 'Puerta interior estándar lacada en blanco con manivela de acero inoxidable.'
    },
    {
      id: 'door_sliding_glass',
      name: 'Ventanal Corredizo de Terraza 3m',
      category: 'architecture',
      icon: 'columns',
      width: 3.20,
      depth: 0.18,
      height: 2.50,
      elevation: 0.0,
      color: '#20242a',
      metalColor: '#a0d8ef',
      isOpening: true,
      description: 'Gran puerta ventanal corredera de suelo a techo con perfilería de aluminio negro y vidrio bajo emisivo.'
    },
    {
      id: 'window_panoramic',
      name: 'Ventana Panorámica Fija 2.4m',
      category: 'architecture',
      icon: 'maximize-2',
      width: 2.40,
      depth: 0.18,
      height: 1.50,
      elevation: 0.90,
      color: '#1a1d24',
      metalColor: '#bde0fe',
      isOpening: true,
      description: 'Ventanal panorámico horizontal con perfilería arquitectónica oculta.'
    },
    {
      id: 'window_standard',
      name: 'Ventana Oscilobatiente Doble 1.2m',
      category: 'architecture',
      icon: 'square',
      width: 1.20,
      depth: 0.18,
      height: 1.20,
      elevation: 1.00,
      color: '#20242a',
      metalColor: '#bde0fe',
      isOpening: true,
      description: 'Ventana de dos hojas con apertura oscilobatiente y doble acristalamiento.'
    },

    // 🛋️ SALA DE ESTAR & ENTRETENIMIENTO
    {
      id: 'sofa_sectional_l',
      name: 'Sofá Seccional en L con Chaise Longue',
      category: 'living',
      icon: 'armchair',
      width: 3.10,
      depth: 2.20,
      height: 0.82,
      elevation: 0.0,
      color: '#d0c8b8', // Warm linen
      accentColor: '#3d4856',
      description: 'Sofá contemporáneo de 4 plazas con módulo chaise longue, tapizado en lino texturizado y cojines mullidos.'
    },
    {
      id: 'sofa_three_seat',
      name: 'Sofá Lineal 3 Plazas Nórdico',
      category: 'living',
      icon: 'couch',
      width: 2.30,
      depth: 0.95,
      height: 0.82,
      elevation: 0.0,
      color: '#4a5568', // Slate grey
      accentColor: '#c49a6c',
      description: 'Sofá de 3 cuerpos de líneas limpias con patas cónicas de roble y tapicería antimanchas.'
    },
    {
      id: 'lounge_chair_eames',
      name: 'Sillón Lounge con Otomana',
      category: 'living',
      icon: 'user-check',
      width: 0.95,
      depth: 0.90,
      height: 0.85,
      elevation: 0.0,
      color: '#202020', // Black leather
      accentColor: '#8c5836', // Walnut shell
      description: 'Sillón relax de diseño ergonómico en cuero italiano y carcasa moldeada de madera de nogal con reposapiés.'
    },
    {
      id: 'coffee_table_set',
      name: 'Mesa de Centro Nogal & Mármol',
      category: 'living',
      icon: 'disc',
      width: 1.20,
      depth: 0.70,
      height: 0.42,
      elevation: 0.0,
      color: '#5c4033', // Walnut
      metalColor: '#2b2b2b',
      description: 'Mesa baja de salón rectangular con sobre de madera natural y patas cruzadas de acero microtexturizado.'
    },
    {
      id: 'tv_unit_oled',
      name: 'Consola de TV con Smart TV OLED 65"',
      category: 'living',
      icon: 'tv',
      width: 2.20,
      depth: 0.45,
      height: 1.55,
      elevation: 0.0,
      color: '#1a1d24',
      accentColor: '#00d2ff', // Screen glow
      description: 'Mueble flotante de televisión con televisor ultra delgado de 65 pulgadas, barra de sonido y repisa iluminada.'
    },
    {
      id: 'rug_moroccan',
      name: 'Alfombra de Área Geométrica 3x2m',
      category: 'living',
      icon: 'square',
      width: 3.00,
      depth: 2.00,
      height: 0.02,
      elevation: 0.005,
      color: '#e8e2d5',
      accentColor: '#303642',
      description: 'Gran alfombra de pelo corto con motivos geométricos escandinavos para delimitar el área social.'
    },
    {
      id: 'lamp_arc_floor',
      name: 'Lámpara de Arco Flos con Foco Cálido',
      category: 'living',
      icon: 'sun',
      width: 0.60,
      depth: 1.40,
      height: 2.15,
      elevation: 0.0,
      color: '#f0f0f0',
      metalColor: '#d4af37',
      isLight: true,
      lightColor: '#ffecb3',
      lightIntensity: 1.2,
      description: 'Elegante lámpara de pie con brazo curvo telescópico y pantalla cóncava de luz cálida difusa.'
    },

    // 🍳 COCINA & COMEDOR
    {
      id: 'kitchen_island_sink',
      name: 'Isla de Cocina con Cascada de Cuarzo y Fregadero',
      category: 'dining_kitchen',
      icon: 'layout',
      width: 2.80,
      depth: 1.10,
      height: 0.92,
      elevation: 0.0,
      color: '#f5f5f7', // Quartz waterfall
      accentColor: '#2d333f', // Dark cabinetry
      metalColor: '#c0c0c0', // Faucet
      description: 'Isla central gourmet con encimera de cuarzo blanco Calacatta en cascada, fregadero bajo encimera y grifo cisne.'
    },
    {
      id: 'kitchen_cook_block',
      name: 'Módulo Cocina con Inducción & Campana',
      category: 'dining_kitchen',
      icon: 'cpu',
      width: 2.60,
      depth: 0.65,
      height: 2.20,
      elevation: 0.0,
      color: '#242a35',
      accentColor: '#121212',
      metalColor: '#d1d5db',
      description: 'Frente de cocina con placa de inducción vitrocerámica de 4 zonas, cajoneras de cierre suave y campana de extracción de acero.'
    },
    {
      id: 'fridge_side_by_side',
      name: 'Refrigerador Side-by-Side Acero Inox',
      category: 'dining_kitchen',
      icon: 'server',
      width: 0.95,
      depth: 0.80,
      height: 1.85,
      elevation: 0.0,
      color: '#cfd4dc',
      metalColor: '#2b2b2b',
      description: 'Frigorífico americano de dos puertas en acero inoxidable cepillado con dispensador de agua y hielo.'
    },
    {
      id: 'oven_tower',
      name: 'Torre de Hornos Empotrados & Microondas',
      category: 'dining_kitchen',
      icon: 'layers',
      width: 0.70,
      depth: 0.65,
      height: 2.20,
      elevation: 0.0,
      color: '#222630',
      accentColor: '#111827',
      description: 'Columna vertical empotrada con horno multifunción pirolítico y microondas integrado con cristal negro.'
    },
    {
      id: 'dining_table_wood',
      name: 'Mesa de Comedor Roble Macizo 8 Puestos',
      category: 'dining_kitchen',
      icon: 'table',
      width: 2.20,
      depth: 1.00,
      height: 0.76,
      elevation: 0.0,
      color: '#c49a6c', // Oak
      metalColor: '#1a1a1a',
      description: 'Mesa de comedor de madera de roble con cantos achaflanados y robusta estructura metálica en U.'
    },
    {
      id: 'dining_chair_set',
      name: 'Set de Sillas de Comedor Escandinavas',
      category: 'dining_kitchen',
      icon: 'check-square',
      width: 0.50,
      depth: 0.55,
      height: 0.82,
      elevation: 0.0,
      color: '#e5e0d8',
      accentColor: '#5c4033',
      description: 'Silla ergonómica de comedor con asiento acolchado y respaldo curvo en contrachapado.'
    },
    {
      id: 'bar_stools_island',
      name: 'Taburetes Altos para Barra (Dúo)',
      category: 'dining_kitchen',
      icon: 'circle',
      width: 0.45,
      depth: 0.45,
      height: 0.75,
      elevation: 0.0,
      color: '#1a1a1a',
      accentColor: '#c49a6c',
      description: 'Par de taburetes de barra regulables con asiento de cuero negro y reposapiés metálico.'
    },
    {
      id: 'pendant_light_dining',
      name: 'Lámpara Colgante Lineal Triple sobre Mesa',
      category: 'dining_kitchen',
      icon: 'anchor',
      width: 1.40,
      depth: 0.25,
      height: 1.10,
      elevation: 1.70,
      color: '#222222',
      metalColor: '#d4af37',
      isLight: true,
      lightColor: '#fff1cc',
      lightIntensity: 1.5,
      description: 'Luminaria suspendida con tres campanas tubulares doradas que proyectan conos de luz cálida.'
    },

    // 🛏️ DORMITORIOS
    {
      id: 'bed_king_suite',
      name: 'Cama King Size con Cabecero Tapizado',
      category: 'bedroom',
      icon: 'bed',
      width: 2.10,
      depth: 2.20,
      height: 1.15,
      elevation: 0.0,
      color: '#343c4a', // Dark slate headboard
      accentColor: '#f0ede6', // Duvet
      description: 'Cama matrimonial de 2.00x2.00m con cabecero alto tapizado en pana gruesa, almohadas de pluma y edredón nórdico.'
    },
    {
      id: 'bed_single',
      name: 'Cama Individual Juvenil con Canapé',
      category: 'bedroom',
      icon: 'inbox',
      width: 1.10,
      depth: 2.05,
      height: 0.90,
      elevation: 0.0,
      color: '#4b5563',
      accentColor: '#e0f2fe',
      description: 'Cama de una plaza con estructura de madera clara y cajonera inferior de almacenamiento.'
    },
    {
      id: 'nightstands_pair',
      name: 'Mesas de Noche Flotantes con Lámpara',
      category: 'bedroom',
      icon: 'tablet',
      width: 0.55,
      depth: 0.42,
      height: 0.65,
      elevation: 0.0,
      color: '#c49a6c',
      accentColor: '#ffeedd',
      isLight: true,
      lightColor: '#ffe7ba',
      lightIntensity: 0.8,
      description: 'Mesa de noche de roble con cajón y lámpara de lectura esférica de luz suave.'
    },
    {
      id: 'wardrobe_closet_sliding',
      name: 'Clóset Vestidor de 3 Puertas Corredizas',
      category: 'bedroom',
      icon: 'columns',
      width: 2.60,
      depth: 0.68,
      height: 2.40,
      elevation: 0.0,
      color: '#e5dec9',
      accentColor: '#1e232d',
      description: 'Gran armario empotrado con puertas correderas de cristal templado ahumado e iluminación interior LED.'
    },
    {
      id: 'desk_home_office',
      name: 'Escritorio Home Office con Laptop & Silla',
      category: 'bedroom',
      icon: 'monitor',
      width: 1.60,
      depth: 0.75,
      height: 0.76,
      elevation: 0.0,
      color: '#c49a6c',
      accentColor: '#111827',
      description: 'Estación de trabajo ergonómica con escritorio de roble, silla ejecutiva de malla transpirable, monitor 27" y flexo.'
    },

    // 🚿 BAÑOS
    {
      id: 'vanity_floating_double',
      name: 'Mueble Lavabo Suspendido con Espejo LED',
      category: 'bathroom',
      icon: 'square',
      width: 1.50,
      depth: 0.52,
      height: 1.70,
      elevation: 0.0,
      color: '#5c4033', // Walnut base
      accentColor: '#ffffff', // White sink
      metalColor: '#00d2ff', // LED backlight
      description: 'Tocador flotante con cajones de madera hidrófuga, lavabo de resina mate y espejo circular con tira LED perimetral.'
    },
    {
      id: 'toilet_wall_hung',
      name: 'Inodoro Suspendido con Pulsador Doble',
      category: 'bathroom',
      icon: 'target',
      width: 0.42,
      depth: 0.58,
      height: 0.42,
      elevation: 0.12,
      color: '#f8f9fa',
      metalColor: '#cccccc',
      description: 'Inodoro suspendido sin brida (rimless) con cisterna empotrada en pared y placa pulsadora de acero cepillado.'
    },
    {
      id: 'bathtub_freestanding',
      name: 'Bañera Exenta Ovalada de Diseño',
      category: 'bathroom',
      icon: 'shield',
      width: 1.75,
      depth: 0.85,
      height: 0.60,
      elevation: 0.0,
      color: '#fdfdfd',
      metalColor: '#2b2b2b',
      description: 'Bañera exenta de superficie sólida (Solid Surface) con formas orgánicas y grifería de pie de caño alto negro mate.'
    },
    {
      id: 'shower_glass_cabin',
      name: 'Mampara Ducha Walk-In con Grifería Negra',
      category: 'bathroom',
      icon: 'sliders',
      width: 1.40,
      depth: 0.90,
      height: 2.10,
      elevation: 0.0,
      color: '#d0e8f2',
      metalColor: '#1a1a1a',
      description: 'Espacio de ducha a ras de suelo con plato extraplano de resina pizarra, cristal fijo de seguridad y rociador efecto lluvia.'
    },

    // 🌿 EXTERIOR & DECORACIÓN
    {
      id: 'plant_monstera',
      name: 'Planta Monstera Deliciosa en Macetero',
      category: 'outdoor',
      icon: 'feather',
      width: 0.65,
      depth: 0.65,
      height: 1.35,
      elevation: 0.0,
      color: '#2d6a4f',
      accentColor: '#e9ecef',
      description: 'Monstera natural de hojas anchas en maceta cilíndrica de cerámica blanca sobre soporte de madera.'
    },
    {
      id: 'outdoor_lounge_set',
      name: 'Set de Terraza Sillones & Mesa Baja',
      category: 'outdoor',
      icon: 'sun',
      width: 2.40,
      depth: 1.80,
      height: 0.75,
      elevation: 0.0,
      color: '#495057',
      accentColor: '#a06a3b',
      description: 'Conjunto exterior para porche o jardín compuesto por sofá de 2 plazas, dos butacas y mesa baja en teca y cuerda trenzada.'
    },
    {
      id: 'swimming_pool_small',
      name: 'Piscina / Espejo de Agua con Deck 4x2.5m',
      category: 'outdoor',
      icon: 'grid',
      width: 4.20,
      depth: 2.60,
      height: 0.30,
      elevation: -0.25,
      color: '#00b4d8',
      accentColor: '#a06a3b',
      description: 'Piscina compacta de inmersión con revestimiento de gresite azul caribeño y borde en tarima de madera.'
    }
  ],

  // Default Initial Project: "Villa Innova Contemporánea" (2-Story House)
  DEFAULT_PROJECT: {
    meta: {
      title: "Villa Innova Contemporánea",
      author: "Innova Architectural Studio",
      created: "2026-09-25",
      unit: "m",
      scale: 1.0
    },
    floors: [
      {
        id: "floor_0",
        name: "Planta Baja (Nivel 0.00m)",
        elevation: 0.0,
        height: 2.80,
        visible: true,
        wallColor: "#EDE8DF", // Warm Linen
        floorMaterial: "wood_oak",
        order: 0
      },
      {
        id: "floor_1",
        name: "Planta Alta (Nivel +2.80m)",
        elevation: 2.80,
        height: 2.80,
        visible: true,
        wallColor: "#F8F9FA", // Pure White
        floorMaterial: "tile_chevron",
        order: 1
      }
    ],
    rooms: [
      // Planta Baja Rooms
      {
        id: "room_living",
        floorId: "floor_0",
        name: "SALA DE ESTAR & SOCIAL",
        x: 0.2,
        y: 0.2,
        width: 5.6,
        depth: 4.8,
        floorMaterial: "wood_oak",
        wallColor: "#EDE8DF"
      },
      {
        id: "room_kitchen_dining",
        floorId: "floor_0",
        name: "COCINA ABIERTA & COMEDOR",
        x: 6.0,
        y: 0.2,
        width: 5.8,
        depth: 4.8,
        floorMaterial: "marble_carrara",
        wallColor: "#F8F9FA"
      },
      {
        id: "room_powder",
        floorId: "floor_0",
        name: "BAÑO DE VISITAS",
        x: 9.2,
        y: 5.2,
        width: 2.6,
        depth: 2.2,
        floorMaterial: "tile_slate",
        wallColor: "#2B323D"
      },
      {
        id: "room_terrace",
        floorId: "floor_0",
        name: "TERRAZA & DECK EXTERIOR",
        x: 0.2,
        y: 5.2,
        width: 5.6,
        depth: 3.4,
        floorMaterial: "deck_teak",
        wallColor: "#EDE8DF"
      },

      // Planta Alta Rooms
      {
        id: "room_master_bedroom",
        floorId: "floor_1",
        name: "MASTER SUITE DORMITORIO",
        x: 0.2,
        y: 0.2,
        width: 6.2,
        depth: 4.8,
        floorMaterial: "wood_oak",
        wallColor: "#EDE8DF"
      },
      {
        id: "room_master_bath",
        floorId: "floor_1",
        name: "BAÑO PRINCIPAL SPA",
        x: 6.6,
        y: 0.2,
        width: 5.2,
        depth: 3.2,
        floorMaterial: "marble_carrara",
        wallColor: "#F8F9FA"
      },
      {
        id: "room_studio_office",
        floorId: "floor_1",
        name: "ESTUDIO / HOME OFFICE",
        x: 6.6,
        y: 3.6,
        width: 5.2,
        depth: 3.8,
        floorMaterial: "wood_walnut",
        wallColor: "#EDE8DF"
      },
      {
        id: "room_upper_balcony",
        floorId: "floor_1",
        name: "BALCÓN MASTER",
        x: 0.2,
        y: 5.2,
        width: 6.2,
        depth: 2.2,
        floorMaterial: "deck_teak",
        wallColor: "#EDE8DF"
      }
    ],
    walls: [
      // Outer Perimeter Walls (Planta Baja)
      { id: "w0_1", floorId: "floor_0", x1: 0.0, y1: 0.0, x2: 12.0, y2: 0.0, thickness: 0.20, height: 2.80, color: "#EDE8DF" },
      { id: "w0_2", floorId: "floor_0", x1: 12.0, y1: 0.0, x2: 12.0, y2: 7.6, thickness: 0.20, height: 2.80, color: "#EDE8DF" },
      { id: "w0_3", floorId: "floor_0", x1: 12.0, y1: 7.6, x2: 0.0, y2: 7.6, thickness: 0.20, height: 2.80, color: "#EDE8DF" },
      { id: "w0_4", floorId: "floor_0", x1: 0.0, y1: 7.6, x2: 0.0, y2: 0.0, thickness: 0.20, height: 2.80, color: "#EDE8DF" },
      // Interior Dividers (Planta Baja)
      { id: "w0_5", floorId: "floor_0", x1: 5.8, y1: 0.0, x2: 5.8, y2: 5.0, thickness: 0.15, height: 2.80, color: "#EDE8DF" },
      { id: "w0_6", floorId: "floor_0", x1: 0.0, y1: 5.0, x2: 5.8, y2: 5.0, thickness: 0.15, height: 2.80, color: "#EDE8DF" },
      { id: "w0_7", floorId: "floor_0", x1: 9.0, y1: 5.0, x2: 12.0, y2: 5.0, thickness: 0.15, height: 2.80, color: "#2B323D" },
      { id: "w0_8", floorId: "floor_0", x1: 9.0, y1: 5.0, x2: 9.0, y2: 7.6, thickness: 0.15, height: 2.80, color: "#2B323D" },

      // Perimeter Walls (Planta Alta)
      { id: "w1_1", floorId: "floor_1", x1: 0.0, y1: 0.0, x2: 12.0, y2: 0.0, thickness: 0.20, height: 2.80, color: "#F8F9FA" },
      { id: "w1_2", floorId: "floor_1", x1: 12.0, y1: 0.0, x2: 12.0, y2: 7.6, thickness: 0.20, height: 2.80, color: "#F8F9FA" },
      { id: "w1_3", floorId: "floor_1", x1: 12.0, y1: 7.6, x2: 0.0, y2: 7.6, thickness: 0.20, height: 2.80, color: "#F8F9FA" },
      { id: "w1_4", floorId: "floor_1", x1: 0.0, y1: 7.6, x2: 0.0, y2: 0.0, thickness: 0.20, height: 2.80, color: "#F8F9FA" },
      // Interior Dividers (Planta Alta)
      { id: "w1_5", floorId: "floor_1", x1: 6.4, y1: 0.0, x2: 6.4, y2: 7.6, thickness: 0.15, height: 2.80, color: "#F8F9FA" },
      { id: "w1_6", floorId: "floor_1", x1: 6.4, y1: 3.4, x2: 12.0, y2: 3.4, thickness: 0.15, height: 2.80, color: "#F8F9FA" },
      { id: "w1_7", floorId: "floor_1", x1: 0.0, y1: 5.0, x2: 6.4, y2: 5.0, thickness: 0.15, height: 2.80, color: "#EDE8DF" }
    ],
    items: [
      // ════════ PLANTA BAJA ITEMS ════════
      // Arquitectura: Escalera conectora que sube a la Planta Alta
      {
        id: "item_stair_01",
        catalogId: "stair_straight",
        floorId: "floor_0",
        name: "Escalera Principal a Planta Alta",
        x: 6.4,
        y: 5.3,
        z: 0.0,
        width: 1.10,
        depth: 3.50,
        height: 2.80,
        rotation: 0,
        color: "#c49a6c"
      },
      // Ventanal y Puertas
      {
        id: "item_door_entry_01",
        catalogId: "door_entry",
        floorId: "floor_0",
        name: "Puerta Principal de Entrada",
        x: 7.8,
        y: 7.5,
        z: 0.0,
        width: 1.20,
        depth: 0.18,
        height: 2.40,
        rotation: 180,
        color: "#5c4033"
      },
      {
        id: "item_sliding_patio_01",
        catalogId: "door_sliding_glass",
        floorId: "floor_0",
        name: "Ventanal Corredizo Sala-Terraza",
        x: 2.8,
        y: 4.95,
        z: 0.0,
        width: 3.20,
        depth: 0.18,
        height: 2.50,
        rotation: 0,
        color: "#20242a"
      },
      {
        id: "item_win_kitchen_01",
        catalogId: "window_panoramic",
        floorId: "floor_0",
        name: "Ventana Panorámica Cocina",
        x: 9.0,
        y: 0.05,
        z: 0.90,
        width: 2.40,
        depth: 0.18,
        height: 1.40,
        rotation: 0,
        color: "#1a1d24"
      },

      // Sala de estar
      {
        id: "item_sofa_01",
        catalogId: "sofa_sectional_l",
        floorId: "floor_0",
        name: "Sofá Modular L Italiano",
        x: 2.8,
        y: 2.2,
        z: 0.0,
        width: 3.10,
        depth: 2.20,
        height: 0.82,
        rotation: 0,
        color: "#d0c8b8"
      },
      {
        id: "item_rug_01",
        catalogId: "rug_moroccan",
        floorId: "floor_0",
        name: "Alfombra Central de Lana",
        x: 2.8,
        y: 2.6,
        z: 0.0,
        width: 3.00,
        depth: 2.00,
        height: 0.02,
        rotation: 0,
        color: "#e8e2d5"
      },
      {
        id: "item_table_coffee_01",
        catalogId: "coffee_table_set",
        floorId: "floor_0",
        name: "Mesa de Centro Nogal",
        x: 2.8,
        y: 2.5,
        z: 0.0,
        width: 1.20,
        depth: 0.70,
        height: 0.42,
        rotation: 0,
        color: "#5c4033"
      },
      {
        id: "item_tv_01",
        catalogId: "tv_unit_oled",
        floorId: "floor_0",
        name: "Mueble TV OLED 65\"",
        x: 2.8,
        y: 0.35,
        z: 0.0,
        width: 2.40,
        depth: 0.45,
        height: 1.55,
        rotation: 0,
        color: "#1a1d24"
      },
      {
        id: "item_lamp_01",
        catalogId: "lamp_arc_floor",
        floorId: "floor_0",
        name: "Lámpara de Arco Flos",
        x: 4.8,
        y: 1.0,
        z: 0.0,
        width: 0.60,
        depth: 1.40,
        height: 2.15,
        rotation: -45,
        color: "#f0f0f0"
      },
      {
        id: "item_plant_01",
        catalogId: "plant_monstera",
        floorId: "floor_0",
        name: "Planta Monstera Rincón",
        x: 0.7,
        y: 0.7,
        z: 0.0,
        width: 0.65,
        depth: 0.65,
        height: 1.35,
        rotation: 0,
        color: "#2d6a4f"
      },

      // Cocina & Comedor
      {
        id: "item_island_01",
        catalogId: "kitchen_island_sink",
        floorId: "floor_0",
        name: "Isla Gourmet de Cuarzo",
        x: 8.8,
        y: 2.1,
        z: 0.0,
        width: 2.80,
        depth: 1.10,
        height: 0.92,
        rotation: 0,
        color: "#f5f5f7"
      },
      {
        id: "item_cook_01",
        catalogId: "kitchen_cook_block",
        floorId: "floor_0",
        name: "Módulo Placa Inducción & Campana",
        x: 8.8,
        y: 0.45,
        z: 0.0,
        width: 2.60,
        depth: 0.65,
        height: 2.20,
        rotation: 0,
        color: "#242a35"
      },
      {
        id: "item_fridge_01",
        catalogId: "fridge_side_by_side",
        floorId: "floor_0",
        name: "Refrigerador Doble Puerta Inox",
        x: 11.3,
        y: 0.55,
        z: 0.0,
        width: 0.95,
        depth: 0.80,
        height: 1.85,
        rotation: 0,
        color: "#cfd4dc"
      },
      {
        id: "item_dining_01",
        catalogId: "dining_table_wood",
        floorId: "floor_0",
        name: "Mesa de Comedor de Roble",
        x: 8.8,
        y: 4.0,
        z: 0.0,
        width: 2.20,
        depth: 1.00,
        height: 0.76,
        rotation: 0,
        color: "#c49a6c"
      },
      {
        id: "item_pendant_01",
        catalogId: "pendant_light_dining",
        floorId: "floor_0",
        name: "Lámparas Colgantes Comedor",
        x: 8.8,
        y: 4.0,
        z: 1.70,
        width: 1.40,
        depth: 0.25,
        height: 1.10,
        rotation: 0,
        color: "#222222"
      },

      // Baño de visitas
      {
        id: "item_toilet_01",
        catalogId: "toilet_wall_hung",
        floorId: "floor_0",
        name: "Inodoro Suspendido Visitas",
        x: 11.2,
        y: 6.4,
        z: 0.12,
        width: 0.42,
        depth: 0.58,
        height: 0.42,
        rotation: 90,
        color: "#f8f9fa"
      },
      {
        id: "item_vanity_01",
        catalogId: "vanity_floating_double",
        floorId: "floor_0",
        name: "Lavamanos Flotante Visitas",
        x: 9.8,
        y: 7.2,
        z: 0.0,
        width: 1.10,
        depth: 0.50,
        height: 1.70,
        rotation: 180,
        color: "#5c4033"
      },

      // Terraza Exterior
      {
        id: "item_outdoor_01",
        catalogId: "outdoor_lounge_set",
        floorId: "floor_0",
        name: "Conjunto Relax Terraza",
        x: 2.8,
        y: 6.6,
        z: 0.0,
        width: 2.40,
        depth: 1.80,
        height: 0.75,
        rotation: 0,
        color: "#495057"
      },

      // ════════ PLANTA ALTA ITEMS ════════
      // Dormitorio Principal Master
      {
        id: "item_bed_master_01",
        catalogId: "bed_king_suite",
        floorId: "floor_1",
        name: "Cama King Master Suite",
        x: 3.1,
        y: 1.8,
        z: 0.0,
        width: 2.10,
        depth: 2.20,
        height: 1.15,
        rotation: 0,
        color: "#343c4a"
      },
      {
        id: "item_nightstand_01",
        catalogId: "nightstands_pair",
        floorId: "floor_1",
        name: "Mesas de Noche con Lámpara",
        x: 3.1,
        y: 0.45,
        z: 0.0,
        width: 3.20,
        depth: 0.45,
        height: 0.65,
        rotation: 0,
        color: "#c49a6c"
      },
      {
        id: "item_wardrobe_01",
        catalogId: "wardrobe_closet_sliding",
        floorId: "floor_1",
        name: "Armario Vestidor 3 Puertas",
        x: 0.65,
        y: 2.8,
        z: 0.0,
        width: 0.68,
        depth: 2.60,
        height: 2.40,
        rotation: 90,
        color: "#e5dec9"
      },
      {
        id: "item_tv_bedroom_01",
        catalogId: "tv_unit_oled",
        floorId: "floor_1",
        name: "TV Pared Dormitorio",
        x: 3.1,
        y: 4.6,
        z: 0.0,
        width: 1.80,
        depth: 0.35,
        height: 1.40,
        rotation: 180,
        color: "#1a1d24"
      },

      // Baño Master Spa
      {
        id: "item_tub_01",
        catalogId: "bathtub_freestanding",
        floorId: "floor_1",
        name: "Tina Exenta de Inmersión",
        x: 10.6,
        y: 1.4,
        z: 0.0,
        width: 1.75,
        depth: 0.85,
        height: 0.60,
        rotation: 90,
        color: "#fdfdfd"
      },
      {
        id: "item_vanity_master_01",
        catalogId: "vanity_floating_double",
        floorId: "floor_1",
        name: "Mueble Doble Seno Master",
        x: 8.4,
        y: 0.4,
        z: 0.0,
        width: 1.60,
        depth: 0.52,
        height: 1.70,
        rotation: 0,
        color: "#5c4033"
      },
      {
        id: "item_shower_01",
        catalogId: "shower_glass_cabin",
        floorId: "floor_1",
        name: "Cabina de Ducha Walk-In",
        x: 7.3,
        y: 2.5,
        z: 0.0,
        width: 1.40,
        depth: 0.90,
        height: 2.10,
        rotation: 0,
        color: "#d0e8f2"
      },
      {
        id: "item_toilet_master_01",
        catalogId: "toilet_wall_hung",
        floorId: "floor_1",
        name: "Inodoro Suspendido Master",
        x: 11.3,
        y: 2.8,
        z: 0.12,
        width: 0.42,
        depth: 0.58,
        height: 0.42,
        rotation: 90,
        color: "#f8f9fa"
      },

      // Estudio / Home Office
      {
        id: "item_desk_01",
        catalogId: "desk_home_office",
        floorId: "floor_1",
        name: "Estación de Trabajo Ejecutiva",
        x: 9.2,
        y: 5.2,
        z: 0.0,
        width: 1.60,
        depth: 0.75,
        height: 0.76,
        rotation: 0,
        color: "#c49a6c"
      },
      {
        id: "item_sofa_office_01",
        catalogId: "sofa_three_seat",
        floorId: "floor_1",
        name: "Sofá de Lectura Despacho",
        x: 9.2,
        y: 6.8,
        z: 0.0,
        width: 2.00,
        depth: 0.85,
        height: 0.80,
        rotation: 180,
        color: "#4a5568"
      },
      {
        id: "item_plant_office_01",
        catalogId: "plant_monstera",
        floorId: "floor_1",
        name: "Planta Ficus Estudio",
        x: 11.2,
        y: 4.0,
        z: 0.0,
        width: 0.65,
        depth: 0.65,
        height: 1.35,
        rotation: 0,
        color: "#2d6a4f"
      }
    ]
  }
};
