import pandas as pd
import glob
import re

# Ruta a los archivos txt
files = glob.glob('puntuaciones/2024-08-02/*.txt')

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

# Imprimir el DataFrame para verificar
print(df_grouped)

# Guardar resultados
output_file = 'resultados/fechadeldia/resultados_agrupados.csv'
df_grouped.to_csv(output_file, index=False)
