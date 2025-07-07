# Errores Comunes de TypeScript y Cómo Prevenirlos

Este archivo sirve como recordatorio de los errores más frecuentes encontrados durante el desarrollo del proyecto y cómo evitarlos en el futuro.

## 1. Variables o parámetros no usados
- **Error:** `'x' is declared but its value is never read.`
- **Prevención:** Elimina variables, parámetros o imports que no se utilicen. Usa `_` como prefijo para variables intencionalmente no usadas.

## 2. Imports incorrectos o inexistentes
- **Error:** `Module '...' has no exported member 'X'` o `Cannot find module '...'`.
- **Prevención:** Verifica que los nombres de los imports coincidan exactamente con los exportados. Usa el autocompletado del editor y revisa los archivos de tipos.

## 3. Tipos incompatibles o conversiones forzadas
- **Error:** `Type 'A' is not assignable to type 'B'` o `Conversion of type 'string' to type 'Currency' may be a mistake...`
- **Prevención:** Usa los tipos correctos y evita conversiones forzadas. Si es necesario, utiliza `as unknown as TipoCorrecto` solo si estás seguro.

## 4. Propiedades inexistentes en tipos
- **Error:** `Property 'x' does not exist on type 'Y'`.
- **Prevención:** Revisa la definición de los tipos y asegúrate de que las propiedades existan. Usa el tipado estricto y actualiza los tipos cuando cambie la estructura de los datos.

## 5. Declaraciones duplicadas o conflictos de tipos
- **Error:** `Subsequent property declarations must have the same type...`
- **Prevención:** No declares dos veces la misma propiedad o interfaz. Centraliza los tipos en un solo archivo y reutilízalos.

## 6. Funciones con parámetros no usados
- **Error:** `'param' is declared but its value is never read.`
- **Prevención:** Elimina los parámetros no usados o renómbralos a `_param` si la firma debe mantenerse.

## 7. Errores en la firma de funciones y tipos
- **Error:** `Object literal may only specify known properties...`
- **Prevención:** Asegúrate de que los objetos solo tengan las propiedades definidas en la interfaz o tipo correspondiente.

## 8. Errores de inicialización de stores o contextos
- **Error:** `Type 'A' is missing the following properties from type 'B': ...`
- **Prevención:** Inicializa los stores/contextos con todos los campos requeridos por el tipo. Usa valores por defecto coherentes.

## 9. Errores de asignación de tipos en hooks personalizados
- **Error:** `Cannot find name 'X'` o `No value exists in scope for the shorthand property 'X'`.
- **Prevención:** Declara y exporta correctamente los tipos y hooks. Usa el tipado explícito en los retornos de hooks complejos.

---

**Recomendaciones generales:**
- Usa el autocompletado y las herramientas del editor para evitar errores de importación y tipado.
- Haz build y lint frecuentemente para detectar errores temprano.
- Mantén los tipos y modelos centralizados y actualizados.
- Elimina código muerto y refactoriza funciones para que sean claras y estrictas en tipos.

---

_Actualiza este archivo si encuentras nuevos errores recurrentes o patrones a evitar._ 