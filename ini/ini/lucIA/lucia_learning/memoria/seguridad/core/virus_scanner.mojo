# virus_scanner.mojo
# Escáner avanzado de virus para lucIA (versión simplificada pero extensible)

# --- Configuración de firmas y patrones ---
let firmas = [
    "eval(", "exec(", "os.system", "subprocess", "base64.b64decode", "__import__", "marshal", "compile(", "globals()", "locals()"
]

let patrones_ofuscacion = [
    "\\x", "chr(", "ord(", "int(", "hex(", "oct(", "rot13", "[::-1]"
]

# --- Función para leer archivos de texto ---
fn leer_archivo(path: String) -> String:
    try:
        with open(path, "r") as f:
            return f.read()
    except Exception as e:
        return ""

# --- Análisis de firmas ---
fn buscar_firmas(contenido: String, firmas: List[String]) -> List[String]:
    let encontradas = []
    for firma in firmas:
        if firma in contenido:
            encontradas.append(firma)
    return encontradas

# --- Heurística básica ---
fn heuristica(contenido: String) -> Int:
    score = 0
    if "def " in contenido and "import " in contenido:
        score += 1  # Código con funciones e imports
    if "lambda" in contenido:
        score += 1
    if contenido.count("if ") > 10:
        score += 1  # Muchos condicionales
    if contenido.count("for ") > 10 or contenido.count("while ") > 10:
        score += 1  # Muchos bucles
    return score

# --- Detección de ofuscación ---
fn detectar_ofuscacion(contenido: String, patrones: List[String]) -> List[String]:
    let encontrados = []
    for patron in patrones:
        if patron in contenido:
            encontrados.append(patron)
    return encontrados

# --- Escaneo principal ---
fn escanear_archivo(path: String) -> Dict[String, Any]:
    resultado = {"archivo": path, "firmas": [], "ofuscacion": [], "heuristica": 0, "riesgo": "bajo"}
    contenido = leer_archivo(path)
    if contenido == "":
        resultado["error"] = "No se pudo leer el archivo"
        return resultado
    resultado["firmas"] = buscar_firmas(contenido, firmas)
    resultado["ofuscacion"] = detectar_ofuscacion(contenido, patrones_ofuscacion)
    resultado["heuristica"] = heuristica(contenido)
    # Sistema de scoring simple
    score = len(resultado["firmas"]) + len(resultado["ofuscacion"]) + resultado["heuristica"]
    if score >= 5:
        resultado["riesgo"] = "alto"
    elif score >= 2:
        resultado["riesgo"] = "medio"
    return resultado

# --- Preparado para integración futura de ML ---
# fn analizar_ml(contenido: String) -> Float:
#     # Aquí se integrará un modelo de machine learning en el futuro
#     return 0.0

# --- Ejemplo de uso ---
if __name__ == "__main__":
    let archivo = "test.py"  # Cambiar por el archivo a analizar
    let resultado = escanear_archivo(archivo)
    print("Resultado del escaneo:", resultado)
