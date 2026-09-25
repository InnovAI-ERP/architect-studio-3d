# ARCHITECT STUDIO 3D — Innova BIM & CAD Engine (v2.4)

[![BIM CAD Engine](https://img.shields.io/badge/BIM%20Engine-v2.4.0-00d2ff?style=for-the-badge)](https://innovaicr.com)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org)
[![License](https://img.shields.io/badge/License-Proprietary-gold?style=for-the-badge)](https://innovaicr.com)

Aplicación profesional de diseño arquitectónico, visualización BIM y dibujo técnico en tiempo real con conmutación fluida entre **Plano 2D CAD** y **Estudio 3D Realista** a un solo clic.

---

## 🏛️ Características Principales

### 1. Motor Gráfico Dual en Tiempo Real (2D CAD + 3D WebGL)
* **Plano Técnico 2D:**
  * Cuadrícula métrica arquitectónica continua (malla mayor a 1.0m, malla menor a 0.25m).
  * Cotas métricas automáticas con precisión centimétrica (`X.XX m`) y marcas angulares de extremo.
  * Muros con representación de doble línea y núcleo de grafito arquitectónico.
  * Cálculo dinámico de superficie construida ($m^2$) por habitación con distintivo central.
  * Simbología CAD estándar: abatimiento de puertas a 90° con arco de clearance, doble línea de vidrios en ventanas, peldaños de escalera numerados con flecha direccional *"SUBE"*, y bloques de mobiliario ergonómicos.
  * Manipulador interactivo con caja delimitadora, asideros de redimensionamiento y círculo de rotación continua (0° a 360° con snap a 15°/45°/90°).

* **Studio 3D Realista:**
  * Renderizado WebGL acelerado por hardware con Three.js.
  * Materiales con sombreado físico PBR (rugosidad, metalicidad, transmisión vítrea y mapas de relieve).
  * Sombras suaves de contacto en tiempo real (`PCFSoftShadowMap`) y oclusión ambiental.
  * Control de hora solar: **Día Soleado**, **Atardecer Dorado** y **Noche Arquitectónica** (con luminarias interiores LED funcionales).
  * Modo **Corte Seccional (*Corte Muros*)**: Ajusta muros a 1.10m para visualizar y recorrer interiores amueblados como maqueta arquitectónica, o a 2.80m de altura completa.
  * Ángulos de cámara rápidos: Órbita libre, Isométrica axonométrica, Cenital superior y Paseo interior.

* **Vista Dividida (Split View 50/50):**
  * Presenta simultáneamente el Plano 2D y el Render 3D lado a lado.
  * Sincronización instantánea de selecciones, traslaciones y rotaciones.

---

### 2. Escaleras Paramétricas de Alto Detalle
* **Escalera Recta Voladiza:** 16 huellas de roble macizo con cantos biselados, zancas estilizadas de acero grafito (`Math.atan2`), barandilla de cristal templado transparente con herrajes de acero inoxidable y pasamanos continuo.
* **Escalera en L con Descanso Intermedio:** Tramo inferior de 8 escalones, descanso a 1.40m y giro a 90° para conectar niveles.
* **Escalera Caracol Helicoidal:** Mástil cilíndrico central con peldaños radiales de diseño escultórico.
* **Modificación total:** Movimiento en ejes X, Y, Z, rotación libre en grados y vinculación entre plantas.

---

### 3. Sistema Multinivel (Plantas & Niveles)
* Soporte para múltiples pisos apilados: **Planta Baja (Nivel 0.00m)** y **Planta Alta (Nivel +2.80m)**.
* Capacidad para añadir nuevas plantas (Azotea, Sótano, Mezzanine).
* Interruptores de visibilidad independiente por planta.
* Modo **Planta Fantasma (Ghost View)** para proyectar los muros de la planta inferior al diseñar la planta alta.

---

### 4. Catálogo Completo de Mobiliario, Utensilios y Artefactos
* **Estructura & Cerramientos:** Muros, escaleras, puertas pivotantes, ventanales corredizos a terraza, ventanas panorámicas fijas.
* **Sala:** Sofás modulares en L, sofás de 3 plazas, sillón lounge con otomana, mesa de centro, mueble de TV con Smart TV OLED 65" con pantalla gráfica, alfombras de área, lámpara de arco con luz cálida real.
* **Cocina & Comedor:** Isla de cocina con encimera de cuarzo Carrara en cascada, fregadero bajo encimera y grifo de cuello de cisne, módulo de cocción de inducción con campana extractora, refrigerador side-by-side inox, mesa de comedor de roble para 8 personas y lámparas colgantes.
* **Dormitorio:** Cama King Size con cabecero acolchado, almohadas, edredón, mesas de noche con lámparas de lectura, clóset vestidor y estación de home office.
* **Baño:** Mueble de tocador suspendido con lavabo cerámico y espejo con halo LED circular, inodoro suspendido con pulsador de doble descarga, bañera exenta ovalada de inmersión y ducha walk-in de cristal.
* **Exterior:** Conjunto de relax de exterior en teca, maceteros con planta Monstera deliciosa y piscina de inmersión con deck perimetral.

---

### 5. Metrado, Cómputo Métrico & Presupuesto
* **Desglose de Áreas ($m^2$):** Tabla detallada por habitación y nivel con cálculo de superficie útil (Total demo: **159.28 $m^2$**).
* **Inventario FF&E:** Conteo automático y cubicación de artefactos y mobiliario instalados.
* **Presupuesto Estimado:** Estimación paramétrica de obra gris, acabados arquitectónicos, equipamiento y reserva de contingencia del 10%.

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Navegador moderno compatible con WebGL (Google Chrome, Safari, Firefox, Edge).
* Python 3.x (o cualquier servidor HTTP estático).

### Ejecución
```bash
# Clonar el repositorio
git clone https://github.com/InnovAI-ERP/architect-studio-3d.git
cd architect-studio-3d

# Iniciar servidor local
python3 server.py
```
Abrir en el navegador:
👉 **`http://localhost:8088/index.html`**

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| `1` | Activar Vista Plano 2D |
| `2` | Activar Vista 3D Realista |
| `3` | Activar Vista Dividida (Split View) |
| `Ctrl+D` / `Cmd+D` | Duplicar elemento seleccionado |
| `Supr` / `Backspace` | Eliminar elemento seleccionado |
| `Ctrl+Z` / `Cmd+Z` | Deshacer acción |
| `Ctrl+Y` / `Cmd+Shift+Z` | Rehacer acción |
| `Ctrl+S` / `Cmd+S` | Guardar proyecto en almacenamiento local |

---

## 📁 Estructura del Código

```
architect-studio-3d/
├── css/
│   └── app.css           # Sistema de diseño CAD dark workstation & modales
├── js/
│   ├── constants.js       # Catálogo de elementos, materiales y proyecto demo
│   ├── textures.js        # Generador de texturas procedurales PBR en canvas
│   ├── models3d.js        # Modelado procedural 3D Three.js
│   ├── renderer2d.js      # Motor de dibujo vectorial CAD 2D
│   ├── renderer3d.js      # Motor WebGL Three.js con sombras y raycasting
│   ├── state.js           # Store reactivo, historial y cálculo de metrado
│   └── app.js             # Controlador principal y enlaces de interfaz
├── server.py              # Servidor HTTP local de desarrollo
├── index.html             # Interfaz de usuario y orquestación
└── README.md              # Documentación técnica del proyecto
```

---
© 2026 Innova.IA — Departamento de Arquitectura & Automatización.
