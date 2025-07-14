# main.py
# Ejecuta todas las funciones de los módulos en las 6 carpetas

import sys
import importlib

carpetas = [f"modulos.carpeta{i}" for i in range(1, 7)]
modulos = [f"modulo{j}" for j in range(1, 7)]

for carpeta in carpetas:
    for modulo in modulos:
        nombre_modulo = f"{carpeta}.{modulo}"
        try:
            mod = importlib.import_module(nombre_modulo)
            funcion = getattr(mod, f"funcion_{modulo}")
            resultado = funcion()
            print(f"{nombre_modulo}: {resultado}")
        except Exception as e:
            print(f"Error ejecutando {nombre_modulo}: {e}")
