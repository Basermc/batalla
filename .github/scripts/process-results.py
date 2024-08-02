import pandas as pd
import glob
import re
import os
from datetime import datetime

# Obtener la fecha actual en formato YYYY-MM-DD
fecha_actual = datetime.now().strftime('%Y-%m-%d')
directorio_puntuaciones = f'puntuaciones/{fecha_actual}'
directorio_resultados = f'resultados/{fecha_actual}'

# Crear directorios si no existen
os.makedirs(directorio_resultados, exist_ok=True)

# Ruta a los archivos txt
files = glob.glob(f'{directorio_puntuaciones}/*.txt')

# Función para extraer datos de una línea de texto
def parse_line(line):
    match = re.match(r"Nombre: (\w+), Puntuaciones: ([\d, ]+), Total: (\d+)", line)
    if match:
        nombre, puntuaciones, total = match.groups()
        puntuaciones = list(map(int, puntuaciones.split(',')))
        return {'name': nombre, 'puntuaciones': puntuaciones, 'total': int(total)}
    else:
        return None

# Leer todos los archivos y procesar las líneas
all_data = []
for file in files:
    with open(file, 'r') as f:
        for line in f:
            data = parse_line(line.strip())
            if data:
                all_data.append(data)

# Convertir a DataFrame
df = pd.DataFrame(all_data)

# Explode la columna 'puntuaciones' para normalizar los datos
df_puntuaciones = df.explode('puntuaciones').reset_index(drop=True)

# Agrupar por nombre y sumar las puntuaciones
df_grouped = df_puntuaciones.groupby('name').agg({
    'puntuaciones': 'sum'
}).reset_index()

# Ordenar por total de mayor a menor y seleccionar los 32 mejores
df_top_32 = df_grouped.sort_values(by='puntuaciones', ascending=False).head(32)

# Imprimir el DataFrame para verificar
print(df_top_32)

# Guardar los mejores freestylers en un archivo de texto
output_file = f'{directorio_resultados}/{fecha_actual}.txt'
with open(output_file, 'w') as f:
    for index, row in df_top_32.iterrows():
        f.write(f"Nombre: {row['name']}, Puntuaciones: {row['puntuaciones']}\n")

print(f'Archivo {output_file} creado')
