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

let chartInstance = null; // Store chart instance to destroy before re-rendering

// ==== Mock Data Generation for AI responses ====
const mockResponses = {
    ventas_mes: {
        title: "Ventas del Mes Actual",
        summary: "Resumen ejecutivo de las ventas realizadas durante el mes en curso. Se observa un buen desempeño general impulsado por la venta de motores y cajas de cambio.",
        metrics: [
            { title: "Facturación Total", value: "45,230€", icon: "ph-currency-eur", trend: "up", trendValue: "+15%" },
            { title: "Ventas Totales", value: "342", icon: "ph-shopping-cart", trend: "up", trendValue: "+8%" },
            { title: "Ticket Medio", value: "132€", icon: "ph-receipt", trend: "up", trendValue: "+5%" },
            { title: "Top Categoría", value: "Motores", icon: "ph-engine", trend: "neutral", trendValue: "0%" }
        ],
        chartData: {
            type: 'bar',
            labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
            datasets: [{
                label: 'Facturación (€)',
                data: [10200, 11500, 9800, 13730],
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        table: {
            headers: ["Categoría", "Unidades Vendidas", "Facturación", "Margen"],
            rows: [
                ["Motores", "45", "18,500€", "42%"],
                ["Cajas de Cambio", "38", "12,400€", "38%"],
                ["Carrocería Frontal", "85", "6,800€", "55%"],
                ["Iluminación", "120", "4,500€", "60%"],
                ["Otros", "54", "3,030€", "45%"]
            ]
        },
        conclusions: "<strong>1. Crecimiento Sostenido:</strong> La facturación ha incrementado un 15% respecto al mes anterior.<br><br><strong>2. Oportunidad en Iluminación:</strong> Aunque el ticket medio de iluminación es bajo, goza del mejor margen (60%). Se recomienda crear packs de faros completos para aumentar el volumen de venta de esta categoría."
    },
    stock_actual: {
        title: "Distribución de Stock Actual",
        summary: "Análisis del inventario almacenado clasificado por familias de producto.",
        metrics: [
            { title: "Piezas Totales", value: "14,500", icon: "ph-stack", trend: "neutral", trendValue: "-1%" },
            { title: "Valor Estimado", value: "850,000€", icon: "ph-vault", trend: "up", trendValue: "+2%" },
            { title: "Rotación", value: "45 días", icon: "ph-arrows-clockwise", trend: "down", trendValue: "-5 días" }
        ],
        chartData: {
            type: 'doughnut',
            labels: ["Mecánica", "Carrocería", "Interior", "Electrónica"],
            datasets: [{
                label: 'Piezas',
                data: [5000, 4500, 3000, 2000],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 1
            }]
        },
        table: {
            headers: ["Familia", "Cantidad (uds)", "Valor (€)"],
            rows: [
                ["Mecánica", "5,000", "450,000€"],
                ["Carrocería", "4,500", "225,000€"],
                ["Interior", "3,000", "75,000€"],
                ["Electrónica", "2,000", "100,000€"]
            ]
        },
        conclusions: "<strong>1. Peso de la Mecánica:</strong> Representa más del 50% del valor inmovilizado. <br><br><strong>2. Optimización:</strong> Reducir stock de Interior mediante promociones cruzadas o venta en lote."
    },
    piezas_top: {
        title: "Ranking de Piezas Más Vendidas (30 Días)",
        summary: "Listado de los recambios con mayor volumen de rotación en el mercado.",
        metrics: [
            { title: "Top 1", value: "Faros Sup.", icon: "ph-lightbulb", trend: "up", trendValue: "+20%" },
            { title: "Top 2", value: "Alternadores", icon: "ph-lightning", trend: "up", trendValue: "+15%" },
            { title: "Top 3", value: "Retrovisores", icon: "ph-car-profile", trend: "down", trendValue: "-5%" }
        ],
        chartData: {
            type: 'bar',
            options: { indexAxis: 'y' },
            labels: ["Faros", "Alternadores", "Retrovisores", "Pilotos", "Motores"],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [145, 112, 98, 85, 45],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        table: {
            headers: ["Posición", "Pieza", "Ventas", "Variación Mensual"],
            rows: [
                ["#1", "Faros Superiores", "145", "+20%"],
                ["#2", "Alternadores", "112", "+15%"],
                ["#3", "Retrovisores Ext.", "98", "-5%"]
            ]
        },
        conclusions: "<strong>1. Dominio de Consumibles:</strong> Las piezas de colisión (faros, retrovisores) dominan la rotación debido a siniestros leves urbanos."
    },
    vehiculos_rentables: {
        title: "Ranking de Vehículos Más Rentables",
        summary: "Análisis del margen de beneficio generado tras descontar coste de compra frente al PVP del despiece total.",
        metrics: [
            { title: "Vehículo Top #1", value: "SEAT Leon '18", icon: "ph-car", trend: "up", trendValue: "+320% ROI" },
            { title: "Vehículo Top #2", value: "VW Golf VII", icon: "ph-car", trend: "up", trendValue: "+280% ROI" }
        ],
        chartData: {
            type: 'bar',
            labels: ["SEAT Leon", "VW Golf", "Peugeot 3008", "Toyota Auris", "Renault Megane"],
            datasets: [{
                label: 'Beneficio Neto (€)',
                data: [4500, 3800, 3100, 2700, 2200],
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1
            }]
        },
        table: {
            headers: ["Modelo", "Coste Compra", "Ventas Acumuladas", "Beneficio Neto"],
            rows: [
                ["SEAT Leon '18", "1,200€", "5,700€", "4,500€"],
                ["VW Golf VII", "1,800€", "5,600€", "3,800€"],
                ["Peugeot 3008", "2,100€", "5,200€", "3,100€"]
            ]
        },
        conclusions: "<strong>1. ROI Extraordinario:</strong> Los compactos del Grupo VAG presentan el mejor margen general debido a la altísima demanda de sus sistemas frontales y cajas automáticas."
    },
    piezas_muertas: {
        title: "Piezas sin Rotación (> 6 Meses)",
        summary: "Identificación de stock inmovilizado tipo C que genera coste de almacén pero carece de demanda real.",
        metrics: [
            { title: "Referencias", value: "1,204", icon: "ph-warning-circle", trend: "up", trendValue: "+12%" },
            { title: "Valor Atrapado", value: "34,200€", icon: "ph-money", trend: "neutral", trendValue: "0%" }
        ],
        chartData: {
            type: 'bar',
            labels: ["Asientos", "Cremalleras", "Puertas Traseras", "Módulos ABS", "Salpicaderos"],
            datasets: [{
                label: 'Cantidad Sin Vender',
                data: [420, 210, 185, 120, 95],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        table: {
            headers: ["Categoría", "Stock Inmovilizado", "Valor Total", "Meses inactivo"],
            rows: [
                ["Asientos Completos", "420", "12,600€", "8 meses"],
                ["Cremalleras Dirección", "210", "8,400€", "7.5 meses"],
                ["Puertas Traseras", "185", "7,400€", "6.2 meses"]
            ]
        },
        conclusions: "<strong>1. Limpieza Necesaria:</strong> 12,600€ del inmovilizado reside en Asientos. <br><br><strong>2. Acción:</strong> Lanzar a chatarreros las piezas de más de 12 meses o enviar al extranjero en lotes económicos."
    },
    default: {
        title: "Informe Generado por IA",
        summary: "He analizado los datos del sistema para responder a tu petición.",
        metrics: [
            { title: "Datos Analizados", value: "12,450", icon: "ph-database", trend: "up", trendValue: "100%" }
        ],
        chartData: {
            type: 'bar',
            labels: ["Dato 1", "Dato 2", "Dato 3"],
            datasets: [{ label: 'Valores', data: [10, 20, 15], backgroundColor: 'rgba(16, 185, 129, 0.7)' }]
        },
        table: { headers: ["Indicador", "Valor"], rows: [["Total", "45"]] },
        conclusions: "<strong>Revisión General:</strong> Los sistemas operan nominalmente bajo las directrices de analítica marcadas."
    }
};

// ==== Related Widgets Definition ====
const allAvailableWidgets = [
    {
        id: "ventas_mes",
        title: "Ventas del mes",
        desc: "Resumen de ventas realizadas durante el mes actual.",
        prompt: "Genera un informe de todas las ventas realizadas durante el mes actual mostrando número total de ventas, facturación total y piezas más vendidas.",
        chartType: "bar",
        chartData: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ data: [12, 19, 15, 22], backgroundColor: '#3b82f6' }] }
    },
    {
        id: "stock_actual",
        title: "Stock actual",
        desc: "Distribución del inventario disponible.",
        prompt: "Muestra el stock disponible agrupado por familia de producto.",
        chartType: "doughnut",
        chartData: { labels: ['A', 'B', 'C', 'D'], datasets: [{ data: [40, 25, 20, 15], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] }
    },
    {
        id: "piezas_top",
        title: "Piezas más vendidas",
        desc: "Ranking de piezas con mayor rotación.",
        prompt: "Genera un ranking de las piezas más vendidas en los últimos 30 días.",
        chartType: "bar-horizontal",
        chartData: { labels: ['P1', 'P2', 'P3', 'P4'], datasets: [{ data: [30, 25, 20, 10], backgroundColor: '#10b981' }] }
    },
    {
        id: "vehiculos_rentables",
        title: "Vehículos más rentables",
        desc: "Vehículos que han generado mayor beneficio.",
        prompt: "Analiza el beneficio generado por cada vehículo desmontado y muestra los más rentables.",
        chartType: "bar",
        chartData: { labels: ['V1', 'V2', 'V3'], datasets: [{ data: [50, 40, 30], backgroundColor: '#8b5cf6' }] }
    },
    {
        id: "piezas_muertas",
        title: "Piezas sin rotación",
        desc: "Identificación de piezas que no se venden.",
        prompt: "Identifica las piezas que llevan más de 6 meses en stock sin vender.",
        chartType: "bar-horizontal-thin",
        chartData: { labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'], datasets: [{ data: [10, 8, 6, 4, 2], backgroundColor: '#ef4444' }] }
    }
];

// ==== Automated Business Recommendations ====
const aiInsights = [
    { text: "Los motores de BMW tienen alta demanda este mes (+15% vs mes anterior).", icon: "ph-trend-up" },
    { text: "Las cajas de cambio de Volkswagen presentan alta rotación (stock menor a 5 días).", icon: "ph-arrows-clockwise" },
    { text: "Alerta: Hay 12 referencias de asientos con más de 8 meses sin vender.", icon: "ph-warning-circle" },
    { text: "El ticket medio ha subido a 132€ impulsado por ventas de carrocería frontal.", icon: "ph-currency-eur" },
    { text: "Oportunidad: El modelo SEAT León '18 está generando un 320% de ROI.", icon: "ph-car" },
    { text: "Stock bajo en alternadores compatibles con grupo VAG.", icon: "ph-lightning" },
];

function updateRecommendations() {
    const box = document.getElementById('recommendationsList');
    if (!box) return;
    
    // Choose 3 random unique insights
    const shuffled = [...aiInsights].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    box.innerHTML = ''; // clear current
    
    selected.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        
        const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
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

// Initialize and schedule updates (e.g., every 30 seconds for demo)
document.addEventListener('DOMContentLoaded', () => {
    updateRecommendations();
    setInterval(updateRecommendations, 30000); 
});

// ==== Event Listeners ====

// Handle quick triggering from dashboard widget
function triggerQuickReport(text) {
    promptInput.value = text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay to let scroll happen, then simulate click
    setTimeout(() => {
        generateBtn.click();
    }, 400);
}

// Handle generation
generateBtn.addEventListener('click', () => {
    const promptValue = promptInput.value.trim().toLowerCase();
    if (!promptValue) {
        alert("Por favor, escribe qué informe necesitas analizar.");
        return;
    }

    // Hide previous report
    reportContainer.classList.add('hidden');
    // Show spinner
    loadingState.classList.remove('hidden');
    generateBtn.disabled = true;

    // Simulate AI delay (1.5 - 2.5 seconds)
    const delay = Math.floor(Math.random() * 1000) + 1500;
    
    setTimeout(() => {
        let selectedData;
        let matchedWidgetId = "default";
        
        // Advanced NLP Matching
        if (promptValue.includes("ventas") && (promptValue.includes("mes") || promptValue.includes("febrero") || promptValue.includes("actual"))) {
            selectedData = mockResponses.ventas_mes;
            matchedWidgetId = "ventas_mes";
        } else if (promptValue.includes("stock") && (promptValue.includes("agrupado") || promptValue.includes("actual") || promptValue.includes("motores") || promptValue.includes("disponible"))) {
            selectedData = mockResponses.stock_actual;
            matchedWidgetId = "stock_actual";
        } else if (promptValue.includes("piezas") && (promptValue.includes("rotación") || promptValue.includes("más vendidas") || promptValue.includes("rank") || promptValue.includes("venden más"))) {
            selectedData = mockResponses.piezas_top;
            matchedWidgetId = "piezas_top";
        } else if (promptValue.includes("vehículo") && (promptValue.includes("beneficio") || promptValue.includes("rentable") || promptValue.includes("margen"))) {
            selectedData = mockResponses.vehiculos_rentables;
            matchedWidgetId = "vehiculos_rentables";
        } else if ((promptValue.includes("piezas") && promptValue.includes("sin vender")) || promptValue.includes("6 meses") || promptValue.includes("mucho tiempo") || promptValue.includes("sin rotación")) {
            selectedData = mockResponses.piezas_muertas;
            matchedWidgetId = "piezas_muertas";
        } else if (promptValue.includes("comparar") || promptValue.includes("comparativa")) {
            // Re-use ventas_mes for comparatives as alternative
             selectedData = mockResponses.ventas_mes;
             matchedWidgetId = "ventas_mes";
        } else {
            selectedData = mockResponses.default;
        }

        renderReport(selectedData, promptValue);
        renderRelatedReports(matchedWidgetId);
        
        loadingState.classList.add('hidden');
        reportContainer.classList.remove('hidden');
        generateBtn.disabled = false;
        
        // Scroll to report smoothly
        reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    }, delay);
});

// ==== Render Functions ====

function renderReport(data, promptText = '') {
    // 1. Text Summary
    reportTitle.textContent = data.title;
    reportSummaryText.textContent = data.summary;

    // 2. Metrics
    metricsContainer.innerHTML = '';
    data.metrics.forEach(metric => {
        const trendIcon = metric.trend === 'up' ? 'ph-trend-up' : (metric.trend === 'down' ? 'ph-trend-down' : 'ph-minus');
        const trendClass = metric.trend === 'up' ? 'trend-up' : (metric.trend === 'down' ? 'trend-down' : '');
        
        const cardHTML = `
            <div class="metric-card">
                <div class="metric-card-header">
                    <span class="metric-title">${metric.title}</span>
                    <i class="ph ${metric.icon} metric-icon"></i>
                </div>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-trend ${trendClass}">
                    <i class="ph ${trendIcon}"></i>
                    <span>${metric.trendValue} vs mes anterior</span>
                </div>
            </div>
        `;
        metricsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 3. Table
    tableHeadRow.innerHTML = '';
    data.table.headers.forEach(header => {
        tableHeadRow.insertAdjacentHTML('beforeend', `<th>${header}</th>`);
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

    // 4. Chart
    const chartContainerDiv = document.getElementById('chartContainerDiv');
    if (chartContainerDiv) chartContainerDiv.classList.remove('hidden');

    if (chartInstance) {
        chartInstance.destroy(); // Clear previous chart
    }

    // Auto-detect chart type based on config or default to bar
    let chartType = data.chartData.type || 'bar';
    let isHorizontal = data.chartData.options && data.chartData.options.indexAxis === 'y';

    // Override based on explicit user prompt keyword intent
    const promptLower = promptText.toLowerCase();
    if (promptLower.includes('compar')) {
        chartType = 'bar';
        isHorizontal = false;
    } else if (promptLower.includes('tendencia') || promptLower.includes('evolución') || promptLower.includes('temporal') || promptLower.includes('mes a mes')) {
        chartType = 'line';
        isHorizontal = false;
    } else if (promptLower.includes('distribución') || promptLower.includes('categorías') || promptLower.includes('circular') || promptLower.includes('quesito')) {
        chartType = 'doughnut';
        isHorizontal = false;
    } else if (promptLower.includes('ranking') || promptLower.includes('top') || promptLower.includes('más vendidas')) {
        chartType = 'bar';
        isHorizontal = true;
    } else if (promptLower.includes('listado')) {
        chartType = 'none';
    }

    if (chartType === 'none') {
        if (chartContainerDiv) chartContainerDiv.classList.add('hidden');
    } else {
        const ctx = document.getElementById('mainChart').getContext('2d');
        let chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        };

        // Apply specific chart configurations
        if (isHorizontal) {
            chartOptions.indexAxis = 'y'; // Horizontal bar
        }
        
        // For non-doughnut charts configure scales
        if(chartType !== 'doughnut' && chartType !== 'pie') {
            chartOptions.scales = {
                y: { beginAtZero: true }
            };
        } else {
            // Doughnut specific
            chartOptions.cutout = '50%';
        }

        chartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.chartData.labels,
                datasets: data.chartData.datasets
            },
            options: chartOptions
        });
    }

    // 5. Conclusions
    if (data.conclusions) {
        reportConclusionsText.innerHTML = data.conclusions;
    }
}

// ==== Related Reports Generation ====
function renderRelatedReports(currentWidgetId) {
    relatedWidgetsGrid.innerHTML = '';
    
    // Filter out the currently selected report to show alternatives
    const relatedWidgets = allAvailableWidgets.filter(w => w.id !== currentWidgetId).slice(0, 3); // Top 3 related
    
    if (relatedWidgets.length === 0) {
        relatedReportsContainer.classList.add('hidden');
        return;
    }
    
    relatedReportsContainer.classList.remove('hidden');

    relatedWidgets.forEach((widget, index) => {
        const thumbCanvasId = `relatedThumb_${index}`;
        const clickPrompt = widget.prompt.replace(/'/g, "\\'"); // escape quotes
        
        const widgetHTML = `
            <div class="widget-card" onclick="triggerQuickReport('${clickPrompt}')">
                <div class="widget-content">
                    <h4>${widget.title}</h4>
                    <p>${widget.desc}</p>
                    <div class="widget-thumbnail">
                        <canvas id="${thumbCanvasId}"></canvas>
                    </div>
                </div>
                <div class="widget-action">
                    <span>Generar informe</span>
                    <i class="ph-bold ph-arrow-right"></i>
                </div>
            </div>
        `;
        
        relatedWidgetsGrid.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Wait for DOM insertion then draw mini-chart
        setTimeout(() => {
            const ctx = document.getElementById(thumbCanvasId);
            if(ctx) {
                renderMiniChart(ctx, widget.chartType, widget.chartData);
            }
        }, 50);
    });
}

function renderMiniChart(canvasElement, type, dataConfig) {
    const thumbOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false,
        elements: { bar: { borderRadius: 4 } },
        layout: { padding: 10 }
    };

    let finalType = 'bar';
    let finalOptions = { ...thumbOptions };

    if (type === 'doughnut') {
        finalType = 'doughnut';
        finalOptions.cutout = '65%';
        delete finalOptions.scales; // No scales for pie
    } else if (type === 'bar-horizontal' || type === 'bar-horizontal-thin') {
        finalOptions.indexAxis = 'y';
    }

    new Chart(canvasElement.getContext('2d'), {
        type: finalType,
        data: dataConfig,
        options: finalOptions
    });
}

// Add enter key support in textarea
promptInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
    }
});

// ==== Quick Dashboard Thumbnails Initialization ====
document.addEventListener('DOMContentLoaded', () => {
    // Shared empty chart config for thumbnails
    const thumbOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false, // disable animation for static look
        elements: { bar: { borderRadius: 4 } },
        layout: { padding: 10 }
    };

    // 1. Ventas del mes (Bar)
    if(document.getElementById('thumbVentas')) {
        new Chart(document.getElementById('thumbVentas').getContext('2d'), {
            type: 'bar',
            data: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ data: [12, 19, 15, 22], backgroundColor: '#3b82f6' }] },
            options: thumbOptions
        });
    }

    // 2. Stock actual (Pie shape)
    if(document.getElementById('thumbStock')) {
        new Chart(document.getElementById('thumbStock').getContext('2d'), {
            type: 'doughnut',
            data: { labels: ['A', 'B', 'C', 'D'], datasets: [{ data: [40, 25, 20, 15], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] },
            options: { ...thumbOptions, cutout: '65%' }
        });
    }

    // 3. Piezas más vendidas (Horizontal Bar)
    if(document.getElementById('thumbPiezasTop')) {
        new Chart(document.getElementById('thumbPiezasTop').getContext('2d'), {
            type: 'bar',
            data: { labels: ['P1', 'P2', 'P3', 'P4'], datasets: [{ data: [30, 25, 20, 10], backgroundColor: '#10b981' }] },
            options: { ...thumbOptions, indexAxis: 'y' }
        });
    }

    // 4. Vehículos rentables (Bar comparative)
    if(document.getElementById('thumbVehiculosRentables')) {
        new Chart(document.getElementById('thumbVehiculosRentables').getContext('2d'), {
            type: 'bar',
            data: { labels: ['V1', 'V2', 'V3'], datasets: [{ data: [50, 40, 30], backgroundColor: '#8b5cf6' }] },
            options: thumbOptions
        });
    }

    // 5. Piezas sin rotación (Thin bars for lists)
    if(document.getElementById('thumbPiezasMuertas')) {
        new Chart(document.getElementById('thumbPiezasMuertas').getContext('2d'), {
            type: 'bar',
            data: { labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'], datasets: [{ data: [10, 8, 6, 4, 2], backgroundColor: '#ef4444' }] },
            options: { ...thumbOptions, indexAxis: 'y' }
        });
    }
});
