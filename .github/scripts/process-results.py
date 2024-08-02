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
df_grouped = df_puntuaciones.groupby('name').sum().reset_index()

# Ordenar por total y seleccionar los 32 mejores freestylers
df_top_32 = df_grouped.sort_values(by='total', ascending=False).head(32)

# Guardar los resultados agrupados y los mejores freestylers
output_file_grouped = f'{directorio_resultados}/resultados_agrupados.csv'
output_file_top_32 = f'{directorio_resultados}/best_freestylers.txt'

# Guardar el DataFrame agrupado como CSV
df_grouped.to_csv(output_file_grouped, index=False)

# Guardar los mejores 32 freestylers como TXT
with open(output_file_top_32, 'w') as f:
    for index, row in df_top_32.iterrows():
        f.write(f"{row['name']}\t{row['total']}\n")

print(f'Resultados guardados en {output_file_grouped}')
print(f'Mejores 32 freestylers guardados en {output_file_top_32}')
print('Archivos creados en el directorio:', directorio_resultados)
