import os
import pandas as pd

# Directorio donde se guardan los resultados
results_dir = 'puntuaciones'

# Lista para almacenar todos los datos
all_data = []

# Leer todos los archivos .txt en el directorio de resultados
for root, dirs, files in os.walk(results_dir):
    for file in files:
        if file.endswith('.txt'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    parts = line.strip().split('|')
                    if len(parts) < 2:
                        continue
                    name = parts[0]
                    scores = list(map(int, parts[1:]))
                    total = sum(scores)
                    all_data.append({'name': name, 'total': total})

# Convertir a DataFrame
df = pd.DataFrame(all_data)

# Agrupar por nombre y sumar las puntuaciones
df_grouped = df.groupby('name').sum().reset_index()

# Ordenar por puntuación total y obtener los 32 mejores
df_sorted = df_grouped.sort_values(by='total', ascending=False)
top_32 = df_sorted.head(32)

# Guardar los resultados en un archivo
with open('best_freestylers.txt', 'w') as f:
    f.write('Nombre\tPuntuación\n')
    for _, row in top_32.iterrows():
        f.write(f"{row['name']}\t{row['total']}\n")
