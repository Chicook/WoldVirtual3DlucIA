#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

install_dependencies() {
    echo "Instalando dependencias..."
    cd "$PROJECT_DIR"
    npm install
}

build_project() {
    echo "Compilando el proyecto..."
    cd "$PROJECT_DIR"
    npm run build
}

deploy_testnet() {
    echo "Desplegando en testnet..."
    cd "$PROJECT_DIR"
    npm run deploy:testnet
}

verify_deploy() {
    echo "Verificando despliegue en testnet..."
    # Aquí puedes añadir comandos específicos de verificación, por ejemplo:
    npm run verify:testnet
}

clean_temp() {
    echo "Limpiando archivos temporales..."
    cd "$PROJECT_DIR"
    rm -rf dist node_modules/.cache
}

show_help() {
    echo "Uso: $0 [comando]"
    echo "Comandos disponibles:"
    echo "  install      Instala dependencias"
    echo "  build        Compila el proyecto"
    echo "  deploy       Despliega en testnet"
    echo "  verify       Verifica el despliegue"
    echo "  clean        Limpia archivos temporales"
    echo "  help         Muestra esta ayuda"
}

case "$1" in
    install)
        install_dependencies
        ;;
    build)
        build_project
        ;;
    deploy)
        deploy_testnet
        ;;
    verify)
        verify_deploy
        ;;
    clean)
        clean_temp
        ;;
    help|*)
        show_help
        ;;
esac