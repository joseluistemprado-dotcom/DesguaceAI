// =====================================================
// ANALISTA IA DEL DESGUACE — Motor de Prompts IA 100%
// =====================================================

// ==== DOM Elements ====
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingState = document.getElementById('loadingState');
const reportContainer = document.getElementById('reportContainer');
const metricsContainer = document.getElementById('metricsContainer');
const tableHeadRow = document.getElementById('tableHeadRow');
const tableBody = document.getElementById('tableBody');
const reportTitle = document.getElementById('reportTitle');
const reportSummaryText = document.getElementById('reportSummaryText');
const reportConclusionsText = document.getElementById('reportConclusionsText');
const relatedWidgetsGrid = document.getElementById('relatedWidgetsGrid');
const relatedReportsContainer = document.getElementById('relatedReportsContainer');

let chartInstance = null;

// =====================================================
// BASE DE CONOCIMIENTO SIMULADA (datos internos de IA)
// =====================================================
//
// VEHÍCULOS: id, marca, modelo, fecha_entrada, coste_compra
// PIEZAS:    id, nombre, familia, vehiculo_id, precio
// VENTAS:    id, pieza_id, fecha, precio_venta, cliente
// STOCK:     pieza_id, cantidad
//
// El agente interpreta el lenguaje natural del usuario
// y genera informes completos usando este contexto interno.
// =====================================================

const aiKnowledgeBase = {

    ventas_mes: {
        title: "Informe de Ventas — Mes Actual",
        summary: "He analizado el total de operaciones de venta registradas en el período en curso. Se detecta un crecimiento del 15% impulsado principalmente por la familia de motores y cajas de cambio de grupo VAG.",
        chartType: "bar",
        chartConfig: {
            labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
            datasets: [{
                label: 'Facturación (€)',
                data: [10200, 11500, 9800, 13730],
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        metrics: [
            { title: "Facturación Total", value: "45,230€", icon: "ph-currency-eur", trend: "up", trendValue: "+15%" },
            { title: "Ventas Totales", value: "342", icon: "ph-shopping-cart", trend: "up", trendValue: "+8%" },
            { title: "Ticket Medio", value: "132€", icon: "ph-receipt", trend: "up", trendValue: "+5%" },
            { title: "Top Categoría", value: "Motores", icon: "ph-engine", trend: "neutral", trendValue: "↑" }
        ],
        table: {
            headers: ["Categoría", "Unidades", "Facturación", "Margen"],
            rows: [
                ["Motores", "45", "18,500€", "42%"],
                ["Cajas de Cambio", "38", "12,400€", "38%"],
                ["Carrocería Frontal", "85", "6,800€", "55%"],
                ["Iluminación", "120", "4,500€", "60%"],
                ["Otros", "54", "3,030€", "45%"]
            ]
        },
        conclusions: "<strong>1. Crecimiento sostenido:</strong> Facturación sube +15% vs mes anterior.<br><br><strong>2. Oportunidad en Iluminación:</strong> Menor ticket pero mayor margen (60%). Recomendamos packs de faros completos para aumentar volumen.<br><br><strong>3. Acción sugerida:</strong> Potenciar stock de cajas automáticas VAG dado el alto margen y velocidad de venta.",
        relatedIds: ["piezas_top", "vehiculos_rentables", "ventas_comparativa"]
    },

    stock_actual: {
        title: "Distribución de Stock por Familia",
        summary: "He cruzado el inventario actual con las familias de pieza registradas. La mecánica representa más del 50% del valor inmovilizado. El período de rotación medio es de 45 días.",
        chartType: "doughnut",
        chartConfig: {
            labels: ["Mecánica", "Carrocería", "Interior", "Electrónica"],
            datasets: [{
                label: 'Piezas en Stock',
                data: [5000, 4500, 3000, 2000],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        metrics: [
            { title: "Piezas Totales", value: "14,500", icon: "ph-stack", trend: "neutral", trendValue: "-1%" },
            { title: "Valor Estimado", value: "850,000€", icon: "ph-vault", trend: "up", trendValue: "+2%" },
            { title: "Rotación Media", value: "45 días", icon: "ph-arrows-clockwise", trend: "down", trendValue: "-5 días" },
            { title: "Familias Activas", value: "4", icon: "ph-tag", trend: "neutral", trendValue: "=" }
        ],
        table: {
            headers: ["Familia", "Cantidad (uds)", "Valor (€)", "% del Total"],
            rows: [
                ["Mecánica", "5,000", "450,000€", "52.9%"],
                ["Carrocería", "4,500", "225,000€", "26.5%"],
                ["Interior", "3,000", "75,000€", "8.8%"],
                ["Electrónica", "2,000", "100,000€", "11.8%"]
            ]
        },
        conclusions: "<strong>1. Peso de la Mecánica:</strong> Representa más del 50% del valor. Vigilar caducidad de consumibles.<br><br><strong>2. Optimización Interior:</strong> Reducir stock mediante promociones cruzadas o lotes B2B.<br><br><strong>3. Acción sugerida:</strong> Auditoría de los 200 artículos de menor rotación en Electrónica.",
        relatedIds: ["piezas_muertas", "piezas_top", "ventas_mes"]
    },

    piezas_top: {
        title: "Ranking de Piezas Más Vendidas — Últimos 30 Días",
        summary: "He procesado todas las ventas del sistema en el último mes e identificado las referencias con mayor velocidad de salida. Las piezas de colisión (faros, retrovisores) dominan la rotación.",
        chartType: "bar-horizontal",
        chartConfig: {
            labels: ["Faros Sup.", "Alternadores", "Retrovisores", "Pilotos Tras.", "Motores"],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [145, 112, 98, 85, 45],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        metrics: [
            { title: "Top Pieza", value: "Faros Sup.", icon: "ph-lightbulb", trend: "up", trendValue: "+20%" },
            { title: "Top #2", value: "Alternadores", icon: "ph-lightning", trend: "up", trendValue: "+15%" },
            { title: "Top #3", value: "Retrovisores", icon: "ph-car-profile", trend: "down", trendValue: "-5%" },
            { title: "Total Líneas", value: "485 uds", icon: "ph-list-numbers", trend: "up", trendValue: "+12%" }
        ],
        table: {
            headers: ["Posición", "Pieza", "Familia", "Ventas (30d)", "Var. Mensual"],
            rows: [
                ["#1", "Faros Superiores", "Iluminación", "145", "+20%"],
                ["#2", "Alternadores", "Mecánica", "112", "+15%"],
                ["#3", "Retrovisores Ext.", "Carrocería", "98", "-5%"],
                ["#4", "Pilotos Traseros", "Iluminación", "85", "+8%"],
                ["#5", "Motores Diesel", "Mecánica", "45", "+3%"]
            ]
        },
        conclusions: "<strong>1. Piezas de colisión:</strong> Faros y retrovisores tienen alta rotación por siniestros urbanos leves. Mantener stock mínimo de 100 uds.<br><br><strong>2. Electromecánica al alza:</strong> Alternadores suben +15%. Relacionado con auge de vehículos más antiguos en circulación.<br><br><strong>3. Acción:</strong> Aumentar reaprovisionamiento en faros y alternadores para las marcas del grupo VAG.",
        relatedIds: ["ventas_mes", "stock_actual", "vehiculos_rentables"]
    },

    vehiculos_rentables: {
        title: "Ranking de Vehículos Más Rentables",
        summary: "He analizado el margen neto de cada vehículo procesado: precio de compra vs. suma de ventas de sus piezas. Los compactos europeos de 2015–2019 presentan el mejor ratio de rentabilidad.",
        chartType: "bar",
        chartConfig: {
            labels: ["SEAT Leon '18", "VW Golf VII", "Peugeot 3008", "Toyota Auris", "Renault Megane"],
            datasets: [{
                label: 'Beneficio Neto (€)',
                data: [4500, 3800, 3100, 2700, 2200],
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        metrics: [
            { title: "Top ROI #1", value: "SEAT Leon '18", icon: "ph-car", trend: "up", trendValue: "+320%" },
            { title: "Top ROI #2", value: "VW Golf VII", icon: "ph-car", trend: "up", trendValue: "+280%" },
            { title: "Beneficio Medio", value: "3,260€", icon: "ph-currency-eur", trend: "up", trendValue: "+18%" },
            { title: "Vehículos Analizados", value: "87", icon: "ph-garage", trend: "neutral", trendValue: "=" }
        ],
        table: {
            headers: ["Vehículo", "Coste Compra", "Ventas de Piezas", "Beneficio Neto", "ROI"],
            rows: [
                ["SEAT Leon '18", "1,200€", "5,700€", "4,500€", "+320%"],
                ["VW Golf VII", "1,800€", "5,600€", "3,800€", "+280%"],
                ["Peugeot 3008", "2,100€", "5,200€", "3,100€", "+248%"],
                ["Toyota Auris", "1,500€", "4,200€", "2,700€", "+180%"],
                ["Renault Megane", "1,100€", "3,300€", "2,200€", "+200%"]
            ]
        },
        conclusions: "<strong>1. ROI extraordinario en VAG:</strong> Los compactos del Grupo VAG presentan la mejor rentabilidad gracias a la altísima demanda de sus piezas de mecánica y transmisión.<br><br><strong>2. Estrategia de compra:</strong> Priorizar SEAT Leon y VW Golf de 2016–2019 en subasta. Mayor ROI garantizado.<br><br><strong>3. Evitar vehículos de lujo:</strong> Altos costes de compra y menor demanda de piezas en el mercado local.",
        relatedIds: ["ventas_mes", "piezas_top", "stock_actual"]
    },

    piezas_muertas: {
        title: "Piezas Sin Rotación — Más de 6 Meses",
        summary: "He identificado todas las referencias del almacén con fecha de entrada anterior a 6 meses y sin registro de venta. El stock inmovilizado asciende a 34,200€ en 1,204 referencias.",
        chartType: "bar",
        chartConfig: {
            labels: ["Asientos", "Cremalleras", "Puertas Tras.", "Módulos ABS", "Salpicaderos"],
            datasets: [{
                label: 'Unidades Sin Vender',
                data: [420, 210, 185, 120, 95],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        metrics: [
            { title: "Referencias Inactivas", value: "1,204", icon: "ph-warning-circle", trend: "up", trendValue: "+12%" },
            { title: "Valor Inmovilizado", value: "34,200€", icon: "ph-money", trend: "neutral", trendValue: "0%" },
            { title: "Categoría Crítica", value: "Asientos", icon: "ph-armchair", trend: "up", trendValue: "420 uds" },
            { title: "Promedio Inactividad", value: "8.4 meses", icon: "ph-clock", trend: "up", trendValue: "+0.8m" }
        ],
        table: {
            headers: ["Categoría", "Uds. Inactivas", "Valor Total", "Tiempo Medio"],
            rows: [
                ["Asientos Completos", "420", "12,600€", "8 meses"],
                ["Cremalleras Dirección", "210", "8,400€", "7.5 meses"],
                ["Puertas Traseras", "185", "7,400€", "6.2 meses"],
                ["Módulos ABS", "120", "4,800€", "9 meses"],
                ["Salpicaderos", "95", "1,900€", "6.5 meses"]
            ]
        },
        conclusions: "<strong>1. Limpieza urgente:</strong> 12,600€ bloqueados en asientos completos sin rotación. Revisar catálogo de compatibilidades.<br><br><strong>2. Acción inmediata:</strong> Enviar piezas > 12 meses a chatarreros o exportar en lotes económicos al mercado internacional.<br><br><strong>3. Promoción activa:</strong> Publicar las cremalleras y módulos ABS en plataformas online especializadas con descuento del 30%.",
        relatedIds: ["stock_actual", "piezas_top", "vehiculos_rentables"]
    },

    ventas_comparativa: {
        title: "Comparativa de Ventas — Este Mes vs. Mes Anterior",
        summary: "He comparado las métricas de ventas entre el período actual y el mes anterior de forma directa. Se observa una mejora en volumen y facturación.",
        chartType: "bar",
        chartConfig: {
            labels: ["Motores", "Cajas Cambio", "Carrocería", "Iluminación", "Interior"],
            datasets: [
                {
                    label: 'Mes Anterior',
                    data: [9200, 8500, 5100, 3200, 1800],
                    backgroundColor: 'rgba(148, 163, 184, 0.7)',
                    borderColor: 'rgba(148, 163, 184, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Mes Actual',
                    data: [10200, 10100, 6400, 4100, 2100],
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        metrics: [
            { title: "Var. Facturación", value: "+15.2%", icon: "ph-trend-up", trend: "up", trendValue: "+15.2%" },
            { title: "Var. Unidades", value: "+8.3%", icon: "ph-shopping-cart", trend: "up", trendValue: "+8.3%" },
            { title: "Mejor Categoría", value: "Cajas Cambio", icon: "ph-gear", trend: "up", trendValue: "+19%" },
            { title: "Menor Crecimiento", value: "Interior", icon: "ph-armchair", trend: "up", trendValue: "+4%" }
        ],
        table: {
            headers: ["Categoría", "Mes Anterior (€)", "Mes Actual (€)", "Variación"],
            rows: [
                ["Motores", "9,200€", "10,200€", "+10.9%"],
                ["Cajas de Cambio", "8,500€", "10,100€", "+18.8%"],
                ["Carrocería", "5,100€", "6,400€", "+25.5%"],
                ["Iluminación", "3,200€", "4,100€", "+28.1%"],
                ["Interior", "1,800€", "2,100€", "+16.7%"]
            ]
        },
        conclusions: "<strong>1. Crecimiento general:</strong> Todas las categorías muestran crecimiento respecto al mes anterior.<br><br><strong>2. Iluminación destaca:</strong> Crecimiento del 28% en iluminación —el mayor de todos los segmentos. Potenciar stock.<br><br><strong>3. Recomendación:</strong> Mantener estrategia actual y reforzar aprovisionamiento en cajas de cambio y carrocería, que son las que más volumen mueven.",
        relatedIds: ["ventas_mes", "piezas_top", "vehiculos_rentables"]
    },

    tendencia_ventas: {
        title: "Tendencia de Ventas — Últimos 6 Meses",
        summary: "He analizado la evolución de las ventas en el semestre. Se aprecia una curva ascendente sostenida con un ligero valle en enero. La tendencia para los próximos meses es positiva.",
        chartType: "line",
        chartConfig: {
            labels: ["Octubre", "Noviembre", "Diciembre", "Enero", "Febrero", "Marzo"],
            datasets: [{
                label: 'Facturación (€)',
                data: [28000, 32000, 38000, 25000, 35000, 45230],
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)'
            }]
        },
        metrics: [
            { title: "Tendencia Global", value: "+61.5%", icon: "ph-trend-up", trend: "up", trendValue: "6m" },
            { title: "Mejor Mes", value: "Marzo", icon: "ph-star", trend: "up", trendValue: "45,230€" },
            { title: "Media Mensual", value: "33,872€", icon: "ph-chart-bar", trend: "up", trendValue: "+8%" },
            { title: "Valle", value: "Enero", icon: "ph-trend-down", trend: "down", trendValue: "25,000€" }
        ],
        table: {
            headers: ["Mes", "Facturación (€)", "Var. Mensual", "Acumulado"],
            rows: [
                ["Octubre", "28,000€", "—", "28,000€"],
                ["Noviembre", "32,000€", "+14.3%", "60,000€"],
                ["Diciembre", "38,000€", "+18.7%", "98,000€"],
                ["Enero", "25,000€", "-34.2%", "123,000€"],
                ["Febrero", "35,000€", "+40%", "158,000€"],
                ["Marzo", "45,230€", "+29.2%", "203,230€"]
            ]
        },
        conclusions: "<strong>1. Pauta estacional:</strong> El valle de enero es normal en el sector. La tendencia anual es claramente positiva.<br><br><strong>2. Diciembre fuerte:</strong> La campaña de diciembre fue rentable. Replicar estrategia en 2026.<br><br><strong>3. Proyección:</strong> Si se mantiene el ritmo de marzo, la facturación anual superará los 540,000€.",
        relatedIds: ["ventas_comparativa", "ventas_mes", "vehiculos_rentables"]
    },

    default: {
        title: "Análisis Generado por Analista IA",
        summary: "He procesado tu consulta y preparado este resumen personalizado basado en los datos operativos del sistema de desguaces.",
        chartType: "bar",
        chartConfig: {
            labels: ["Categoría A", "Categoría B", "Categoría C", "Categoría D"],
            datasets: [{
                label: 'Valores Analizados',
                data: [42, 28, 35, 50],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        metrics: [
            { title: "Registros Procesados", value: "12,450", icon: "ph-database", trend: "up", trendValue: "100%" }
        ],
        table: {
            headers: ["Indicador", "Valor", "Estado"],
            rows: [
                ["Sistema operativo", "OK", "✅"],
                ["Datos disponibles", "12,450 registros", "✅"],
                ["Última sincronización", "Hace 2 min", "✅"]
            ]
        },
        conclusions: "<strong>Consulta Procesada:</strong> No he encontrado una plantilla exacta para tu petición, pero puedo generar cualquier informe si especificas más detalles. Prueba: <em>\"Ventas de este mes\"</em>, <em>\"Stock por familia\"</em>, <em>\"Piezas que no se venden\"</em>.",
        relatedIds: ["ventas_mes", "stock_actual", "piezas_top"]
    }
};

// =====================================================
// MOTOR NLP: Interpreta el prompt del usuario
// =====================================================
function interpretPrompt(promptLower) {
    // --- Ventas comparativas ---
    if ((promptLower.includes('compar') || promptLower.includes('vs') || promptLower.includes('versus') || promptLower.includes('frente')) &&
        (promptLower.includes('venta') || promptLower.includes('mes') || promptLower.includes('factura'))) {
        return { key: 'ventas_comparativa', widgetId: 'ventas_comparativa' };
    }
    // --- Tendencia temporal ---
    if (promptLower.includes('tendencia') || promptLower.includes('evoluc') || promptLower.includes('6 meses') ||
        promptLower.includes('semest') || promptLower.includes('históri') || promptLower.includes('mes a mes')) {
        return { key: 'tendencia_ventas', widgetId: 'ventas_mes' };
    }
    // --- Ventas del mes / período ---
    if (promptLower.includes('venta') && (promptLower.includes('mes') || promptLower.includes('actual') ||
        promptLower.includes('febrero') || promptLower.includes('marzo') || promptLower.includes('enero') ||
        promptLower.includes('informe de venta') || promptLower.includes('resumen de venta'))) {
        return { key: 'ventas_mes', widgetId: 'ventas_mes' };
    }
    // --- Stock e inventario ---
    if (promptLower.includes('stock') || promptLower.includes('inventario') || promptLower.includes('almacén') ||
        (promptLower.includes('familia') && promptLower.includes('pieza')) ||
        (promptLower.includes('stock') && promptLower.includes('motores'))) {
        return { key: 'stock_actual', widgetId: 'stock_actual' };
    }
    // --- Piezas más vendidas / ranking ---
    if ((promptLower.includes('pieza') || promptLower.includes('recambio')) &&
        (promptLower.includes('más vendid') || promptLower.includes('ranking') || promptLower.includes('rotaci') ||
         promptLower.includes('venden más') || promptLower.includes('mejor') || promptLower.includes('top'))) {
        return { key: 'piezas_top', widgetId: 'piezas_top' };
    }
    // --- Vehículos rentables ---
    if ((promptLower.includes('vehículo') || promptLower.includes('vehiculo') || promptLower.includes('coche') || promptLower.includes('modelo')) &&
        (promptLower.includes('rentable') || promptLower.includes('beneficio') || promptLower.includes('margen') || promptLower.includes('roi'))) {
        return { key: 'vehiculos_rentables', widgetId: 'vehiculos_rentables' };
    }
    // --- Piezas sin rotación / muertas ---
    if ((promptLower.includes('sin vender') || promptLower.includes('sin rotaci') || promptLower.includes('mucho tiempo') ||
         promptLower.includes('6 meses') || promptLower.includes('inactiv') || promptLower.includes('parad') ||
         (promptLower.includes('pieza') && promptLower.includes('no se vend')))) {
        return { key: 'piezas_muertas', widgetId: 'piezas_muertas' };
    }
    // --- Fallback a ventas genéricas ---
    if (promptLower.includes('venta') || promptLower.includes('factura')) {
        return { key: 'ventas_mes', widgetId: 'ventas_mes' };
    }
    return { key: 'default', widgetId: 'default' };
}

// =====================================================
// SELECCIÓN AUTOMÁTICA DE TIPO DE GRÁFICO
// =====================================================
function resolveChartType(dataKey, promptLower) {
    // Keyword overrides from user prompt
    if (promptLower.includes('circular') || promptLower.includes('quesito') || promptLower.includes('distribuci'))
        return 'doughnut';
    if (promptLower.includes('línea') || promptLower.includes('linea') || promptLower.includes('tendencia') || promptLower.includes('evoluc'))
        return 'line';
    if (promptLower.includes('ranking') || promptLower.includes('horizontal') || promptLower.includes('barras horizontales'))
        return 'bar-horizontal';
    if (promptLower.includes('listado'))
        return 'none';
    if (promptLower.includes('compar'))
        return 'bar';

    // Fall back to the AI data's built-in chart type
    const d = aiKnowledgeBase[dataKey];
    return d ? (d.chartType || 'bar') : 'bar';
}

// =====================================================
// WIDGETS RELACIONADOS (sugerencias post-informe)
// =====================================================
const widgetCatalog = [
    {
        id: "ventas_mes",
        title: "Ventas del mes",
        desc: "resumen de ventas actuales",
        prompt: "Genera un informe de todas las ventas realizadas durante el mes actual, mostrando número total de ventas, facturación total, piezas más vendidas, y miniatura de gráfico de barras.",
        chartType: "bar",
        chartData: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ data: [10, 12, 9, 14], backgroundColor: '#3b82f6', borderRadius: 4 }] }
    },
    {
        id: "stock_actual",
        title: "Stock actual",
        desc: "distribución del inventario por familia",
        prompt: "Muestra el stock disponible agrupado por familia, incluyendo miniatura de gráfico circular.",
        chartType: "doughnut",
        chartData: { labels: ['Mec.', 'Car.', 'Int.', 'Elec.'], datasets: [{ data: [40, 30, 15, 15], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] }
    },
    {
        id: "piezas_top",
        title: "Piezas más vendidas",
        desc: "ranking de piezas con mayor rotación",
        prompt: "Genera ranking de piezas más vendidas últimos 30 días, miniatura de gráfico de barras horizontales.",
        chartType: "bar",
        chartData: { labels: ['Faros', 'Alt.', 'Retro.', 'Pil.'], datasets: [{ data: [30, 22, 18, 12], backgroundColor: '#10b981', borderRadius: 4 }] }
    },
    {
        id: "vehiculos_rentables",
        title: "Vehículos más rentables",
        desc: "beneficio por vehículo",
        prompt: "Analiza beneficio generado por cada vehículo y muestra los más rentables, incluyendo miniatura de gráfico de barras.",
        chartType: "bar",
        chartData: { labels: ['SEAT', 'VW', 'Peu.'], datasets: [{ data: [45, 38, 31], backgroundColor: '#8b5cf6', borderRadius: 4 }] }
    },
    {
        id: "piezas_muertas",
        title: "Piezas sin rotación",
        desc: "piezas que no se venden",
        prompt: "Identifica piezas con más de 6 meses sin vender, miniatura de tabla o gráfico de barras.",
        chartType: "bar",
        chartData: { labels: ['Asientos', 'Crem.', 'Puertas'], datasets: [{ data: [42, 21, 18], backgroundColor: '#ef4444', borderRadius: 4 }] }
    },
    {
        id: "ventas_comparativa",
        title: "Comparativa de ventas",
        desc: "este mes vs. mes anterior",
        prompt: "Comparativa de ventas este mes vs mes anterior por categoría.",
        chartType: "bar",
        chartData: { labels: ['Mot.', 'Caj.', 'Car.'], datasets: [{ data: [9, 8, 5], backgroundColor: '#94a3b8', borderRadius: 4 }, { data: [10, 10, 6], backgroundColor: '#3b82f6', borderRadius: 4 }] }
    },
    {
        id: "tendencia_ventas",
        title: "Tendencia de ventas",
        desc: "evolución en los últimos 6 meses",
        prompt: "Muéstrame la tendencia de ventas en los últimos 6 meses.",
        chartType: "line",
        chartData: { labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'], datasets: [{ data: [28, 32, 38, 25, 35, 45], borderColor: '#3b82f6', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.4 }] }
    }
];

// =====================================================
// RECOMENDACIONES AUTOMÁTICAS DE NEGOCIO IA
// =====================================================
const aiInsights = [
    { text: "Los motores de BMW tienen alta demanda este mes (+15% vs mes anterior).", icon: "ph-trend-up", type: "up" },
    { text: "Las cajas de cambio Volkswagen presentan alta rotación — stock menor a 5 días.", icon: "ph-arrows-clockwise", type: "up" },
    { text: "Alerta: 12 referencias de asientos con más de 8 meses sin vender.", icon: "ph-warning-circle", type: "warn" },
    { text: "El ticket medio ha subido a 132€ impulsado por ventas de carrocería frontal.", icon: "ph-currency-eur", type: "up" },
    { text: "Oportunidad: SEAT León '18 genera un ROI del 320% sobre coste de compra.", icon: "ph-car", type: "up" },
    { text: "Stock bajo en alternadores compatibles con grupo VAG — reaprovisionar.", icon: "ph-lightning", type: "warn" },
    { text: "Las piezas de iluminación tienen el mejor margen del mes: 60%.", icon: "ph-lightbulb", type: "up" },
    { text: "34,200€ inmovilizados en piezas sin rotación. Se recomienda revisión urgente.", icon: "ph-money", type: "warn" },
    { text: "Carrocería frontal: +25% de ventas respecto al mes anterior.", icon: "ph-trend-up", type: "up" }
];

function updateRecommendations() {
    const box = document.getElementById('recommendationsList');
    if (!box) return;
    const shuffled = [...aiInsights].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    box.innerHTML = '';
    selected.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const typeColor = insight.type === 'warn' ? 'border-left-color: #f59e0b; background-color: #fffbeb;' : '';
        item.setAttribute('style', typeColor);
        item.innerHTML = `
            <i class="ph-fill ${insight.icon}"></i>
            <div>
                <p class="recommendation-text">${insight.text}</p>
                <span class="recommendation-time">Analizado a las ${timeStr}</span>
            </div>
        `;
        box.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateRecommendations();
    setInterval(updateRecommendations, 30000);
    renderWidgetThumbnails();
});

// =====================================================
// THUMBNAILS DE WIDGETS
// =====================================================
function renderWidgetThumbnails() {
    const thumbMap = {
        thumbVentas: widgetCatalog.find(w => w.id === 'ventas_mes'),
        thumbStock: widgetCatalog.find(w => w.id === 'stock_actual'),
        thumbPiezasTop: widgetCatalog.find(w => w.id === 'piezas_top'),
        thumbVehiculosRentables: widgetCatalog.find(w => w.id === 'vehiculos_rentables'),
        thumbPiezasMuertas: widgetCatalog.find(w => w.id === 'piezas_muertas')
    };

    for (const [canvasId, widget] of Object.entries(thumbMap)) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !widget) continue;
        const ctx = canvas.getContext('2d');
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            animation: { duration: 700 },
            scales: {}
        };
        let type = widget.chartType;
        if (type === 'bar-horizontal') { type = 'bar'; options.indexAxis = 'y'; }
        if (type !== 'doughnut' && type !== 'pie' && type !== 'line') {
            options.scales = { x: { display: false }, y: { display: false } };
        }
        new Chart(ctx, { type: type === 'line' ? 'line' : (type === 'doughnut' ? 'doughnut' : 'bar'), data: widget.chartData, options });
    }
}

// =====================================================
// TRIGGERING DESDE WIDGET
// =====================================================
function triggerQuickReport(text) {
    promptInput.value = text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { generateBtn.click(); }, 500);
}

// =====================================================
// EVENTO PRINCIPAL — GENERAR INFORME
// =====================================================
generateBtn.addEventListener('click', () => {
    const promptRaw = promptInput.value.trim();
    if (!promptRaw) {
        alert("Por favor, escribe qué informe necesitas analizar.");
        return;
    }
    const promptLower = promptRaw.toLowerCase();
    reportContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    generateBtn.disabled = true;

    const delay = Math.floor(Math.random() * 800) + 1400;

    setTimeout(() => {
        const { key, widgetId } = interpretPrompt(promptLower);
        const data = aiKnowledgeBase[key];
        const chartType = resolveChartType(key, promptLower);

        renderReport(data, chartType, promptRaw);
        renderRelatedReports(data.relatedIds || []);

        loadingState.classList.add('hidden');
        reportContainer.classList.remove('hidden');
        generateBtn.disabled = false;
        reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, delay);
});

// =====================================================
// RENDERIZADO DEL INFORME
// =====================================================
function renderReport(data, chartType, promptRaw) {
    // 1. Título y Resumen
    reportTitle.textContent = data.title;
    reportSummaryText.textContent = data.summary;

    // 2. Métricas
    metricsContainer.innerHTML = '';
    data.metrics.forEach(metric => {
        const trendIcon = metric.trend === 'up' ? 'ph-trend-up' : (metric.trend === 'down' ? 'ph-trend-down' : 'ph-minus');
        const trendClass = metric.trend === 'up' ? 'trend-up' : (metric.trend === 'down' ? 'trend-down' : '');
        metricsContainer.insertAdjacentHTML('beforeend', `
            <div class="metric-card">
                <div class="metric-card-header">
                    <span class="metric-title">${metric.title}</span>
                    <i class="ph ${metric.icon} metric-icon"></i>
                </div>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-trend ${trendClass}">
                    <i class="ph ${trendIcon}"></i>
                    <span>${metric.trendValue}</span>
                </div>
            </div>
        `);
    });

    // 3. Tabla de Datos
    tableHeadRow.innerHTML = '';
    data.table.headers.forEach(h => {
        tableHeadRow.insertAdjacentHTML('beforeend', `<th>${h}</th>`);
    });
    tableBody.innerHTML = '';
    data.table.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    // 4. Gráfico
    const chartContainer = document.getElementById('chartContainerDiv');
    if (chartType === 'none') {
        if (chartContainer) chartContainer.classList.add('hidden');
    } else {
        if (chartContainer) chartContainer.classList.remove('hidden');
        if (chartInstance) chartInstance.destroy();

        const ctx = document.getElementById('mainChart').getContext('2d');
        let type = chartType;
        let isHorizontal = false;

        if (type === 'bar-horizontal') { type = 'bar'; isHorizontal = true; }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20, font: { size: 13 } } }
            }
        };
        if (isHorizontal) chartOptions.indexAxis = 'y';
        if (type !== 'doughnut' && type !== 'pie') {
            chartOptions.scales = { y: { beginAtZero: true } };
        } else {
            chartOptions.cutout = '55%';
        }

        chartInstance = new Chart(ctx, {
            type,
            data: {
                labels: data.chartConfig.labels,
                datasets: data.chartConfig.datasets
            },
            options: chartOptions
        });
    }

    // 5. Conclusiones
    if (data.conclusions) {
        reportConclusionsText.innerHTML = data.conclusions;
    }
}

// =====================================================
// WIDGETS RELACIONADOS POST-INFORME
// =====================================================
function renderRelatedReports(relatedIds) {
    if (!relatedWidgetsGrid || !relatedReportsContainer) return;
    relatedWidgetsGrid.innerHTML = '';

    const toRender = (relatedIds || [])
        .map(id => widgetCatalog.find(w => w.id === id))
        .filter(Boolean)
        .slice(0, 3);

    if (toRender.length === 0) {
        relatedReportsContainer.classList.add('hidden');
        return;
    }
    relatedReportsContainer.classList.remove('hidden');

    toRender.forEach((widget, idx) => {
        const canvasId = `relatedThumb_${widget.id}_${Date.now()}_${idx}`;
        const card = document.createElement('div');
        card.className = 'widget-card';
        card.onclick = () => triggerQuickReport(widget.prompt);
        card.innerHTML = `
            <div class="widget-content">
                <h4>${widget.title}</h4>
                <p>${widget.desc}</p>
                <div class="widget-thumbnail">
                    <canvas id="${canvasId}"></canvas>
                </div>
            </div>
            <div class="widget-action">
                <span>Ver informe</span>
                <i class="ph-bold ph-arrow-right"></i>
            </div>
        `;
        relatedWidgetsGrid.appendChild(card);

        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let type = widget.chartType;
            const opts = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { duration: 500 },
                scales: {}
            };
            if (type === 'bar-horizontal') { type = 'bar'; opts.indexAxis = 'y'; }
            if (type !== 'doughnut' && type !== 'line') {
                opts.scales = { x: { display: false }, y: { display: false, beginAtZero: true } };
            }
            new Chart(ctx, { type, data: widget.chartData, options: opts });
        }, 100);
    });
}
