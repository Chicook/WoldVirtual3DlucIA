#!/bin/bash
# Realiza una copia de seguridad de la base de datos y archivos importantes
echo "Realizando backup..."
tar -czvf backup_$(date +%F).tar.gz ./data ./assets 