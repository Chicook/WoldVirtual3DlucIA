# Sistema de Diseño Blender-Godot

## 📋 Descripción General

Este sistema de diseño está inspirado en las interfaces de **Blender** y **Godot**, combinando:
- **Blender**: Interfaz oscura, paneles flotantes, iconografía clara
- **Godot**: Colores vibrantes, organización por pestañas, feedback visual

## 🎨 Estructura de Archivos

```
css/
├── themes/
│   └── blender-godot-theme.css          # Variables y tema base
├── components/
│   └── blender-godot-components.css     # Componentes específicos
├── animations/
│   └── blender-godot-animations.css     # Animaciones y efectos
├── layouts/
│   └── blender-godot-layouts.css        # Sistemas de layout
└── utilities/
    └── blender-godot-utilities.css      # Clases utilitarias
```

## 🚀 Instalación

### 1. Importar en tu proyecto

```html
<!-- En tu HTML principal -->
<link rel="stylesheet" href="css/themes/blender-godot-theme.css">
<link rel="stylesheet" href="css/components/blender-godot-components.css">
<link rel="stylesheet" href="css/animations/blender-godot-animations.css">
<link rel="stylesheet" href="css/layouts/blender-godot-layouts.css">
<link rel="stylesheet" href="css/utilities/blender-godot-utilities.css">
```

### 2. Configurar fuentes (opcional)

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 🎯 Uso Básico

### Layout Principal del Editor

```html
<div class="editor-layout">
  <header class="editor-header">
    <!-- Header content -->
  </header>
  
  <aside class="editor-sidebar-left">
    <!-- Sidebar izquierda -->
  </aside>
  
  <main class="editor-main">
    <!-- Contenido principal -->
  </main>
  
  <aside class="editor-sidebar-right">
    <!-- Sidebar derecha -->
  </aside>
  
  <footer class="editor-footer">
    <!-- Footer -->
  </footer>
</div>
```

### Sistema de Pestañas

```html
<div class="tab-container">
  <div class="tab-header">
    <button class="tab-button active">Pestaña 1</button>
    <button class="tab-button">Pestaña 2</button>
    <button class="tab-button">Pestaña 3</button>
  </div>
  
  <div class="tab-content">
    <div class="tab-panel active">
      <!-- Contenido pestaña 1 -->
    </div>
    <div class="tab-panel">
      <!-- Contenido pestaña 2 -->
    </div>
    <div class="tab-panel">
      <!-- Contenido pestaña 3 -->
    </div>
  </div>
</div>
```

### Paneles Flotantes

```html
<div class="panel-floating" style="top: 100px; left: 100px;">
  <div class="panel-header">
    <span>Panel Flotante</span>
    <button class="panel-close">×</button>
  </div>
  <div class="panel-content">
    <!-- Contenido del panel -->
  </div>
  <div class="panel-resize-handle"></div>
</div>
```

## 🎨 Componentes Disponibles

### Botones

```html
<!-- Botones básicos -->
<button class="btn btn-primary">Botón Primario</button>
<button class="btn btn-secondary">Botón Secundario</button>
<button class="btn btn-ghost">Botón Fantasma</button>
<button class="btn btn-danger">Botón Peligro</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>
<button class="btn btn-primary btn-xl">Extra Grande</button>
```

### Tarjetas

```html
<div class="card">
  <div class="card-header">
    <h3>Título de la Tarjeta</h3>
  </div>
  <div class="card-body">
    <p>Contenido de la tarjeta...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Acción</button>
  </div>
</div>
```

### Badges

```html
<span class="badge badge-primary">Nuevo</span>
<span class="badge badge-success">Completado</span>
<span class="badge badge-warning">Advertencia</span>
<span class="badge badge-error">Error</span>
```

### Tooltips

```html
<div class="tooltip">
  <span>Hover para ver tooltip</span>
  <div class="tooltip-content">
    Este es el contenido del tooltip
  </div>
</div>
```

## 🎭 Animaciones

### Animaciones de Entrada

```html
<div class="animate-fade-in">Aparece con fade</div>
<div class="animate-slide-in-left">Desliza desde la izquierda</div>
<div class="animate-slide-in-right">Desliza desde la derecha</div>
<div class="animate-slide-in-up">Desliza desde abajo</div>
<div class="animate-scale-in">Aparece escalando</div>
```

### Animaciones de Hover

```html
<button class="btn btn-primary hover-pulse">Pulsa al hover</button>
<button class="btn btn-primary hover-glow">Brilla al hover</button>
<button class="btn btn-primary hover-shake">Se agita al hover</button>
<button class="btn btn-primary hover-bounce">Rebota al hover</button>
```

### Estados de Carga

```html
<div class="loading-spin">Cargando...</div>
<div class="loading-dots">Cargando<span></span></div>
<div class="loading-bar">Progreso</div>
<div class="loading-pulse">Pulsando</div>
```

## 📱 Responsive Design

### Breakpoints

- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

### Grid Responsivo

```html
<div class="grid-layout grid-3">
  <!-- 3 columnas en desktop, 1 en mobile -->
</div>

<div class="grid-layout grid-auto-fit">
  <!-- Columnas automáticas que se ajustan -->
</div>
```

## 🎨 Variables CSS Personalizables

### Colores

```css
:root {
  /* Paleta Blender */
  --blender-bg-primary: #2a2a2a;
  --blender-bg-secondary: #323232;
  --blender-bg-panel: #424242;
  
  /* Paleta Godot */
  --godot-accent-primary: #478cbf;
  --godot-accent-secondary: #5fb3d3;
  --godot-success: #4caf50;
  --godot-warning: #ff9800;
  --godot-error: #f44336;
}
```

### Espaciado

```css
:root {
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-8: 2rem;     /* 32px */
  /* ... más espaciados */
}
```

### Tipografía

```css
:root {
  --font-family-sans: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  --font-size-base: 1rem;
  --font-weight-medium: 500;
}
```

## 🔧 Utilidades CSS

### Espaciado

```html
<div class="m-4">Margin 16px</div>
<div class="p-4">Padding 16px</div>
<div class="mt-2 mb-4">Margin top 8px, bottom 16px</div>
```

### Flexbox

```html
<div class="flex items-center justify-between">
  <span>Izquierda</span>
  <span>Derecha</span>
</div>
```

### Posicionamiento

```html
<div class="relative">
  <div class="absolute top-0 right-0">Posicionado</div>
</div>
```

### Texto

```html
<p class="text-lg font-semibold text-primary">Texto grande y semibold</p>
<p class="text-sm text-muted">Texto pequeño y muted</p>
```

## 🎯 Casos de Uso Específicos

### Editor 3D

```html
<div class="editor-layout">
  <header class="editor-header">
    <div class="toolbar-layout">
      <div class="toolbar-group">
        <button class="btn btn-ghost">Seleccionar</button>
        <button class="btn btn-ghost">Mover</button>
        <button class="btn btn-ghost">Rotar</button>
        <button class="btn btn-ghost">Escalar</button>
      </div>
    </div>
  </header>
  
  <aside class="editor-sidebar-left">
    <div class="tools-panel">
      <div class="tools-header">Herramientas</div>
      <div class="tools-content">
        <div class="tool-item active">
          <div class="tool-icon">🎯</div>
          <span>Selección</span>
        </div>
      </div>
    </div>
  </aside>
  
  <main class="editor-main">
    <!-- Canvas 3D aquí -->
  </main>
  
  <aside class="editor-sidebar-right">
    <div class="properties-panel">
      <div class="property-group">
        <div class="property-group-header">Transform</div>
        <div class="property-group-content">
          <div class="property-row">
            <span class="property-label">X:</span>
            <input class="property-value" type="number" value="0">
          </div>
        </div>
      </div>
    </div>
  </aside>
</div>
```

### Panel de Notificaciones

```html
<div class="notification-enter">
  <div class="badge badge-success">✓</div>
  <span>Operación completada exitosamente</span>
</div>
```

## 🚀 Mejores Prácticas

### 1. Jerarquía Visual
- Usa `--text-primary` para texto principal
- Usa `--text-secondary` para texto secundario
- Usa `--text-muted` para texto de ayuda

### 2. Espaciado Consistente
- Usa las variables de espaciado predefinidas
- Mantén consistencia en márgenes y padding

### 3. Estados Interactivos
- Siempre incluye estados hover
- Usa animaciones sutiles para feedback

### 4. Accesibilidad
- Mantén contraste adecuado
- Incluye focus states visibles
- Respeta `prefers-reduced-motion`

## 🔍 Troubleshooting

### Problemas Comunes

1. **Variables CSS no funcionan**
   - Asegúrate de importar `blender-godot-theme.css` primero
   - Verifica que las variables estén definidas

2. **Animaciones no se ejecutan**
   - Verifica que `blender-godot-animations.css` esté importado
   - Asegúrate de que el elemento tenga la clase correcta

3. **Layout no se ve bien en mobile**
   - Verifica que uses las clases responsive correctas
   - Revisa los breakpoints en `blender-godot-layouts.css`

### Debug

```css
/* Para debug, agrega esto temporalmente */
* {
  outline: 1px solid red;
}
```

## 📚 Recursos Adicionales

- [Documentación de Blender UI](https://docs.blender.org/manual/en/latest/interface/index.html)
- [Documentación de Godot UI](https://docs.godotengine.org/en/stable/tutorials/ui/index.html)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**Nota**: Este sistema está diseñado para ser modular y extensible. Puedes personalizar las variables CSS para adaptarlo a tus necesidades específicas. 