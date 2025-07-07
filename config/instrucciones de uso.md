# Instrucciones de Uso — Configuración Modular con Poetry

Esta carpeta centraliza la gestión de dependencias y utilidades de configuración para el metaverso cripto 3D descentralizado usando Python y Poetry.

## ¿Qué es Poetry?
Poetry es una herramienta moderna para gestionar dependencias y entornos virtuales en proyectos Python, ideal para sistemas modulares y escalables.

---

## Primeros pasos

1. **Instala Poetry** (si no lo tienes):
   ```sh
   pip install poetry
   ```

2. **Instala las dependencias del proyecto:**
   ```sh
   poetry install
   ```
   Esto creará un entorno virtual y descargará todas las dependencias listadas en `pyproject.toml`.

3. **Agrega nuevas dependencias:**
   ```sh
   poetry add <paquete>
   ```
   Ejemplo:
   ```sh
   poetry add requests
   ```

4. **Estructura recomendada para módulos:**
   ```
   config/
     pyproject.toml
     src/
       modulo1/
         __init__.py
       modulo2/
         __init__.py
   ```

5. **Ejecuta scripts dentro del entorno Poetry:**
   ```sh
   poetry run python src/modulo1/tu_script.py
   ```

---

## Consejos
- Mantén todas las dependencias globales y de configuración en `pyproject.toml`.
- Usa la carpeta `src/` para organizar tus módulos y utilidades.
- Puedes importar y reutilizar código entre módulos fácilmente.
- Documenta cada módulo con su propio `README.md` si es necesario.

---

¿Dudas o problemas? Consulta la documentación oficial de Poetry: https://python-poetry.org/docs/
