import csv
import random
from datetime import datetime, timedelta

# Constants for realism
BRANDS = {
    "BMW": ["3 Series", "5 Series", "X1", "X3", "X5"],
    "Audi": ["A3", "A4", "A6", "Q3", "Q5"],
    "Mercedes": ["C-Class", "E-Class", "A-Class", "GLC", "GLE"],
    "Ford": ["Focus", "Fiesta", "Kuga", "Mondeo"],
    "Seat": ["Leon", "Ibiza", "Ateca", "Arona"],
    "Opel": ["Corsa", "Astra", "Insignia", "Mokka"],
    "Toyota": ["Corolla", "Yaris", "Rav4", "Auris"]
}

FAMILIES = {
    "Motor": (200, 800, ["Motor 1.6", "Motor 2.0 TDI", "Culata", "Turbo", "Caja de cambios"]),
    "Frenos": (40, 120, ["Freno delantero", "Freno trasero", "Disco de freno", "Pinza de freno"]),
    "Suspensión": (60, 150, ["Amortiguador", "Muelle", "Brazo de suspensión"]),
    "Electricidad": (30, 200, ["Batería 12V", "Alternador", "Motor de arranque", "Faro Xenon"]),
    "Carrocería": (50, 400, ["Puerta", "Capó", "Paragolpes", "Retrovisor", "Aleta"]),
    "Ruedas": (20, 100, ["Llanta Aleación", "Neumático", "Rueda repuesto"]),
    "Interior": (20, 150, ["Volante", "Asiento", "Salpicadero", "Pomo de cambio"])
}

CHANNELS = ["Recambio Verde", "eBay", "Wallapop", "Recambio Azul", "Ovoko"]

def random_date(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start_date + timedelta(seconds=random_second)

start_period = datetime(2025, 1, 1)
end_period = datetime.now()

# 1. Generate Vehicles (100)
vehicles = []
for i in range(1, 101):
    brand = random.choice(list(BRANDS.keys()))
    model = random.choice(BRANDS[brand])
    date_in = random_date(start_period, end_period).strftime("%Y-%m-%d")
    cost = random.randint(500, 3000)
    vehicles.append({
        "id_vehiculo": i,
        "marca": brand,
        "modelo": model,
        "fecha_entrada": date_in,
        "coste_compra": cost
    })

# 2. Generate Pieces (5,000)
pieces = []
for i in range(1, 5001):
    family_name = random.choice(list(FAMILIES.keys()))
    min_p, max_p, names = FAMILIES[family_name]
    name = random.choice(names)
    v_id = random.randint(1, 100)
    price = random.randint(min_p, max_p)
    channel = random.choice(CHANNELS)
    stock = random.randint(1, 50)
    pieces.append({
        "id_pieza": i,
        "nombre": name,
        "familia": family_name,
        "vehiculo_id": v_id,
        "precio": price,
        "canal_venta": channel,
        "stock_disponible": stock
    })

# 3. Generate Sales
# We want some pieces sold multiple times, some not sold.
# Let's say we pick 2000 pieces to have at least one sale.
sales = []
sale_id_counter = 1
# Pick pieces for sales
sampled_pieces = random.sample(pieces, 2000)

for p in sampled_pieces:
    # Some pieces sell multiple times (up to 3)
    num_sales = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
    for _ in range(num_sales):
        sale_date = random_date(start_period, end_period).strftime("%Y-%m-%d")
        # price variation +-10%
        variation = random.uniform(0.9, 1.1)
        price_sold = round(p["precio"] * variation, 2)
        channel_sold = random.choice(CHANNELS)
        sales.append({
            "id_venta": sale_id_counter,
            "pieza_id": p["id_pieza"],
            "fecha_venta": sale_date,
            "precio_venta": price_sold,
            "canal_venta": channel_sold
        })
        sale_id_counter += 1

# Write CSV files
def write_csv(filename, data, fieldnames):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

write_csv('vehiculos.csv', vehicles, ["id_vehiculo", "marca", "modelo", "fecha_entrada", "coste_compra"])
write_csv('piezas.csv', pieces, ["id_pieza", "nombre", "familia", "vehiculo_id", "precio", "canal_venta", "stock_disponible"])
write_csv('ventas.csv', sales, ["id_venta", "pieza_id", "fecha_venta", "precio_venta", "canal_venta"])

print("CSVs generated successfully.")
