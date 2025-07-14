#!/bin/bash

set -e

# Limpiar builds anteriores
clean() {
    echo "Limpiando builds anteriores..."
    rm -rf dist build artifacts cache
}

# Compilar código fuente
build_source() {
    echo "Compilando código fuente..."
    npm run build
}

# Compilar smart contracts
compile_contracts() {
    echo "Compilando smart contracts..."
    npx hardhat compile
}

# Ejecutar pruebas
run_tests() {
    echo "Ejecutando pruebas..."
    npm test
    npx hardhat test
}

# Desplegar contratos (red de prueba)
deploy_contracts() {
    echo "Desplegando smart contracts en red de prueba..."
    npx hardhat run scripts/deploy.js --network goerli
}

# Generar documentación
generate_docs() {
    echo "Generando documentación..."
    npm run docs || echo "No se encontró el comando de documentación."
}

# Menú principal
main() {
    clean
    build_source
    compile_contracts
    run_tests
    generate_docs
    # Descomenta la siguiente línea si quieres desplegar automáticamente
    # deploy_contracts
    echo "¡Compilación y procesos avanzados completados!"
}

main "$@"