import pandas as pd
import glob
import re
import os
from datetime import datetime

# Obtener la fechaa actual en formato YYYY-MM-DD
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
        return {'name': nombre, 'puntuaciones': puntuaciones}
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

# Imprimir el DataFrame para verificar
print(df_puntuaciones)

# Guardar las puntuaciones en un archivo de texto
output_file = f'{directorio_resultados}/puntuaciones_individuales.txt'
with open(output_file, 'w') as f:
    for index, row in df_puntuaciones.iterrows():
        f.write(f"Nombre: {row['name']}, Puntuación: {row['puntuaciones']}\n")

print(f'Archivo puntuaciones_individuales.txt creado en {directorio_resultados}')
