#!/usr/bin/env python3
"""
Script para consultar la memoria de LucIA
"""

import sqlite3
import json
from pathlib import Path

def consultar_memoria():
    """Consulta la memoria de LucIA"""
    
    # Ruta de la base de datos
    db_path = Path("lucia_learning/lucia_memory.db")
    
    if not db_path.exists():
        print("❌ No se encontró la base de datos de memoria")
        return
    
    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📋 Tablas encontradas: {[table[0] for table in tables]}")
        
        # Verificar estructura de la tabla memory_entries
        print("\n🔍 ESTRUCTURA DE LA TABLA MEMORY_ENTRIES:")
        print("="*60)
        
        try:
            cursor.execute("PRAGMA table_info(memory_entries)")
            columns = cursor.fetchall()
            print("Columnas disponibles:")
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
                
        except sqlite3.OperationalError as e:
            print(f"❌ Error verificando estructura: {e}")
            
        # Consultar conversaciones recientes
        print("\n🔄 ÚLTIMAS CONVERSACIONES:")
        print("="*60)
        
        try:
            # Intentar con diferentes nombres de columnas
            cursor.execute("""
                SELECT * FROM memory_entries 
                ORDER BY id DESC 
                LIMIT 5
            """)
            
            entries = cursor.fetchall()
            
            if entries:
                for i, entry in enumerate(entries, 1):
                    print(f"\n📝 Entrada {i}:")
                    print(f"   ID: {entry[0]}")
                    print(f"   Contenido: {str(entry)[:200]}...")
                    print("-" * 40)
            else:
                print("❌ No se encontraron entradas de memoria")
                
        except sqlite3.OperationalError as e:
            print(f"❌ Error consultando memoria: {e}")
            
        # Consultar estadísticas
        print("\n📊 ESTADÍSTICAS DE MEMORIA:")
        print("="*60)
        
        try:
            cursor.execute("SELECT COUNT(*) FROM memory_entries")
            total_entries = cursor.fetchone()[0]
            print(f"   📝 Total de entradas: {total_entries}")
            
            cursor.execute("SELECT source_api, COUNT(*) FROM memory_entries GROUP BY source_api")
            sources = cursor.fetchall()
            print(f"   🤖 Distribución por fuente:")
            for source, count in sources:
                print(f"      - {source}: {count} entradas")
                
        except sqlite3.OperationalError as e:
            print(f"❌ Error consultando estadísticas: {e}")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Error accediendo a la memoria: {e}")

if __name__ == "__main__":
    consultar_memoria() 