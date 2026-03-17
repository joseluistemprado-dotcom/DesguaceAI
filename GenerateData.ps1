# PowerShell script to generate simulated scrapyard data

$Brands = @{
    "BMW" = @("3 Series", "5 Series", "X1", "X3", "X5")
    "Audi" = @("A3", "A4", "A6", "Q3", "Q5")
    "Mercedes" = @("C-Class", "E-Class", "A-Class", "GLC", "GLE")
    "Ford" = @("Focus", "Fiesta", "Kuga", "Mondeo")
    "Seat" = @("Leon", "Ibiza", "Ateca", "Arona")
    "Opel" = @("Corsa", "Astra", "Insignia", "Mokka")
    "Toyota" = @("Corolla", "Yaris", "Rav4", "Auris")
}

$Families = @{
    "Motor" = @{Min=200; Max=800; Names=@("Motor 1.6", "Motor 2.0 TDI", "Caja de cambios", "Turbo")}
    "Frenos" = @{Min=40; Max=120; Names=@("Freno delantero", "Freno trasero", "Disco de freno")}
    "Suspensión" = @{Min=60; Max=150; Names=@("Amortiguador", "Muelle")}
    "Electricidad" = @{Min=30; Max=200; Names=@("Batería 12V", "Alternador", "Motor de arranque")}
    "Carrocería" = @{Min=50; Max=400; Names=@("Puerta", "Capó", "Retrovisor")}
    "Ruedas" = @{Min=20; Max=100; Names=@("Llanta Aleación", "Neumático")}
    "Interior" = @{Min=20; Max=150; Names=@("Volante", "Asiento", "Salpicadero")}
}

$Channels = @("Recambio Verde", "eBay", "Wallapop", "Recambio Azul", "Ovoko")

$StartDate = Get-Date -Year 2025 -Month 1 -Day 1
$EndDate = Get-Date

function Get-RandomDate {
    $Span = $EndDate - $StartDate
    $RandomDays = Get-Random -Maximum $Span.Days
    return $StartDate.AddDays($RandomDays).ToString("yyyy-MM-dd")
}

# 1. Generate Vehicles (100)
$Vehiculos = New-Object System.Collections.Generic.List[PSObject]
for ($i = 1; $i -le 100; $i++) {
    $Brand = ($Brands.Keys | Get-Random)
    $Model = ($Brands[$Brand] | Get-Random)
    $Vehiculos.Add([PSCustomObject]@{
        id_vehiculo = $i
        marca = $Brand
        modelo = $Model
        fecha_entrada = Get-RandomDate
        coste_compra = Get-Random -Minimum 500 -Maximum 3000
    })
}

# 2. Generate Pieces (5000)
$Piezas = New-Object System.Collections.Generic.List[PSObject]
for ($i = 1; $i -le 5000; $i++) {
    $FamilyName = ($Families.Keys | Get-Random)
    $FInfo = $Families[$FamilyName]
    $Name = ($FInfo.Names | Get-Random)
    $Piezas.Add([PSCustomObject]@{
        id_pieza = $i
        nombre = $Name
        familia = $FamilyName
        vehiculo_id = Get-Random -Minimum 1 -Maximum 100
        precio = Get-Random -Minimum $FInfo.Min -Maximum $FInfo.Max
        canal_venta = ($Channels | Get-Random)
        stock_disponible = Get-Random -Minimum 1 -Maximum 50
    })
}

# 3. Generate Sales
$Ventas = New-Object System.Collections.Generic.List[PSObject]
$SaleCounter = 1

# Pick about 40% of pieces to be sold
$PiecesToSell = $Piezas | Get-Random -Count 2000

foreach ($p in $PiecesToSell) {
    # Some sell multiple times
    $NumSales = 1
    $Rand = Get-Random -Maximum 100
    if ($Rand -gt 80) { $NumSales = 2 }
    if ($Rand -gt 95) { $NumSales = 3 }

    for ($j = 0; $j -lt $NumSales; $j++) {
        $Var = (Get-Random -Minimum 90 -Maximum 111) / 100.0
        $Ventas.Add([PSCustomObject]@{
            id_venta = $SaleCounter
            pieza_id = $p.id_pieza
            fecha_venta = Get-RandomDate
            precio_venta = [math]::Round($p.precio * $Var, 2)
            canal_venta = ($Channels | Get-Random)
        })
        $SaleCounter++
    }
}

# Export to CSV
$Vehiculos | Export-Csv -Path "vehiculos.csv" -NoTypeInformation -Encoding UTF8
$Piezas | Export-Csv -Path "piezas.csv" -NoTypeInformation -Encoding UTF8
$Ventas | Export-Csv -Path "ventas.csv" -NoTypeInformation -Encoding UTF8

Write-Host "CSV files generated successfully."
