// =====================================================
// DESGUACEPRO — Motor SaaS Completo v2.0
// =====================================================

// === ESTADO GLOBAL ===
const DB = { vehiculos: [], piezas: [], ventas: [] };
let currentView = 'bi';
let chartInstance = null;
let currentReportData = null;

// Paginación
const PAGE_SIZE = 50;
const pagination = { vehiculos: 1, recambios: 1, ventas: 1 };

// === DOM REFERENCES ===
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingState = document.getElementById('loadingState');
const reportContainer = document.getElementById('reportContainer');
const reportTitle = document.getElementById('reportTitle');
const reportSummaryText = document.getElementById('reportSummaryText');
const metricsContainer = document.getElementById('metricsContainer');
const tableHeadRow = document.getElementById('tableHeadRow');
const tableBody = document.getElementById('tableBody');
const reportConclusionsText = document.getElementById('reportConclusionsText');
const relatedReportsContainer = document.getElementById('relatedReportsContainer');
const relatedWidgetsGrid = document.getElementById('relatedWidgetsGrid');

// =====================================================
// 1. DATA ENGINE — Carga CSVs en memoria
// =====================================================
function loadCSV(file) {
    return new Promise((resolve) => {
        Papa.parse(file, {
            download: true, header: true, skipEmptyLines: true,
            complete: (r) => resolve(r.data)
        });
    });
}

async function initDataEngine() {
    try {
        const [v, p, ve] = await Promise.all([
            loadCSV('vehiculos.csv'),
            loadCSV('piezas.csv'),
            loadCSV('ventas.csv')
        ]);
        DB.vehiculos = v;
        DB.piezas = p;
        DB.ventas = ve;
        onDataReady();
    } catch(e) {
        console.warn('CSVs no disponibles, usando datos de demostración.');
        useDemoData();
        onDataReady();
    }
}

function useDemoData() {
    const marcas = ['BMW', 'Audi', 'Ford', 'Seat', 'Toyota'];
    const modelos = {'BMW':['3 Series','X3'],'Audi':['A3','Q5'],'Ford':['Focus','Kuga'],'Seat':['Leon','Ibiza'],'Toyota':['Corolla','Yaris']};
    const familias = ['Motor', 'Frenos', 'Suspensión', 'Electricidad', 'Carrocería', 'Ruedas', 'Interior'];
    const names = {'Motor':['Motor 1.6','Caja de cambios','Turbo'],'Frenos':['Freno delantero','Disco de freno'],'Suspensión':['Amortiguador','Muelle'],'Electricidad':['Batería 12V','Alternador'],'Carrocería':['Puerta','Capó','Retrovisor'],'Ruedas':['Llanta Aleación','Neumático'],'Interior':['Volante','Asiento']};
    const canales = ['Recambio Verde','eBay','Wallapop','Recambio Azul','Ovoko'];
    const rndDate = () => { const d = new Date(2025, Math.floor(Math.random()*14), Math.floor(Math.random()*28)+1); return d.toISOString().split('T')[0]; };
    const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
    for (let i = 1; i <= 100; i++) {
        const m = marcas[rnd(0,4)];
        DB.vehiculos.push({ id_vehiculo: String(i), marca: m, modelo: modelos[m][rnd(0,1)], fecha_entrada: rndDate(), coste_compra: String(rnd(500,3000)) });
    }
    for (let i = 1; i <= 500; i++) {
        const fam = familias[rnd(0,6)];
        const prices = {'Motor':rnd(200,800),'Frenos':rnd(40,120),'Suspensión':rnd(60,150),'Electricidad':rnd(30,200),'Carrocería':rnd(50,400),'Ruedas':rnd(20,100),'Interior':rnd(20,150)};
        DB.piezas.push({ id_pieza: String(i), nombre: names[fam][rnd(0,names[fam].length-1)], familia: fam, vehiculo_id: String(rnd(1,100)), precio: String(prices[fam]), canal_venta: canales[rnd(0,4)], stock_disponible: String(rnd(1,50)) });
    }
    const sampled = DB.piezas.slice(0, 200);
    let saleId = 1;
    sampled.forEach(p => {
        const times = rnd(1, 3);
        for (let j = 0; j < times; j++) {
            DB.ventas.push({ id_venta: String(saleId++), pieza_id: p.id_pieza, fecha_venta: rndDate(), precio_venta: String((parseFloat(p.precio) * (0.9 + Math.random()*0.2)).toFixed(2)), canal_venta: canales[rnd(0,4)] });
        }
    });
}

function onDataReady() {
    updateDashboardKPIs();
    renderWidgetThumbnails();
    generateAutoInsights();
    updateRecommendations();
    setInterval(updateRecommendations, 30000);
}

// =====================================================
// 2. NAVEGACIÓN SPA
// =====================================================
const VIEWS = { dashboard: 'view-dashboard', vehiculos: 'view-vehiculos', recambios: 'view-recambios', ventas: 'view-ventas', bi: 'view-bi' };
const NAV_TITLES = {
    dashboard: ['Dashboard', 'Resumen general del negocio'],
    vehiculos: ['Vehículos', 'Listado y gestión de vehículos'],
    recambios: ['Recambios', 'Catálogo de piezas y stock'],
    ventas: ['Historial de Ventas', 'Registro de todas las transacciones'],
    bi: ['Inteligencia IA', 'Analista IA del Desguace']
};

function navigateTo(view) {
    currentView = view;
    Object.values(VIEWS).forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    const target = document.getElementById(VIEWS[view]);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navEl = document.getElementById('nav-' + view);
    if (navEl) navEl.classList.add('active');

    document.getElementById('pageTitle').textContent = NAV_TITLES[view][0];
    document.getElementById('pageSubtitle').textContent = NAV_TITLES[view][1];

    if (view === 'dashboard') renderDashboard();
    else if (view === 'vehiculos') renderVehiculos();
    else if (view === 'recambios') renderRecambios();
    else if (view === 'ventas') renderVentas();
}

['dashboard', 'vehiculos', 'recambios', 'ventas', 'bi'].forEach(v => {
    const el = document.getElementById('nav-' + v);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(v); });
});

// =====================================================
// 3. DASHBOARD — KPIs y gráficos
// =====================================================
let dashCharts = {};
function updateDashboardKPIs() {
    const totalIngresos = DB.ventas.reduce((s, v) => s + parseFloat(v.precio_venta || 0), 0);
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('kpiVehiculos', DB.vehiculos.length);
    el('kpiPiezas', DB.piezas.length);
    el('kpiIngresos', formatEur(totalIngresos));
    el('kpiVentas', DB.ventas.length);
}

function renderDashboard() {
    updateDashboardKPIs();
    // Canal chart
    const canalTotals = {};
    DB.ventas.forEach(v => { canalTotals[v.canal_venta] = (canalTotals[v.canal_venta] || 0) + parseFloat(v.precio_venta || 0); });
    const cLabels = Object.keys(canalTotals), cVals = Object.values(canalTotals);
    renderDashChart('dashCanalChart', 'bar', cLabels, [{data: cVals, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'], borderRadius: 6}]);

    // Familia chart
    const famTotals = {};
    DB.piezas.forEach(p => { famTotals[p.familia] = (famTotals[p.familia] || 0) + 1; });
    renderDashChart('dashFamiliaChart', 'doughnut', Object.keys(famTotals), [{data: Object.values(famTotals), backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'], borderWidth: 0}]);

    // Monthly ingresos
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const monthLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const monthData = months.map(m => DB.ventas.filter(v => { const d = new Date(v.fecha_venta); return d.getMonth() + 1 === m && d.getFullYear() === 2025; }).reduce((s, v) => s + parseFloat(v.precio_venta || 0), 0));
    renderDashChart('dashIngresosChart', 'line', monthLabels, [{data: monthData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, pointRadius: 4}]);
}

function renderDashChart(canvasId, type, labels, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (dashCharts[canvasId]) dashCharts[canvasId].destroy();
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: type === 'doughnut' ? 'right' : 'bottom', labels: { font: { size: 12 } } } } };
    if (type === 'bar' || type === 'line') opts.scales = { y: { beginAtZero: true, ticks: { callback: v => formatEur(v) } } };
    if (type === 'doughnut') opts.cutout = '60%';
    dashCharts[canvasId] = new Chart(canvas.getContext('2d'), { type, data: { labels, datasets }, options: opts });
}

// =====================================================
// 4. VISTA VEHÍCULOS
// =====================================================
function renderVehiculos() {
    applyVehiculosFilters();
    document.getElementById('vehiculoSearch').addEventListener('input', applyVehiculosFilters);
    document.getElementById('vehiculoFechaDesde').addEventListener('change', applyVehiculosFilters);
    document.getElementById('vehiculoFechaHasta').addEventListener('change', applyVehiculosFilters);
    document.getElementById('vehiculoResetFilters').addEventListener('click', () => {
        document.getElementById('vehiculoSearch').value = '';
        document.getElementById('vehiculoFechaDesde').value = '';
        document.getElementById('vehiculoFechaHasta').value = '';
        applyVehiculosFilters();
    });
}
function applyVehiculosFilters() {
    const q = document.getElementById('vehiculoSearch').value.toLowerCase();
    const fd = document.getElementById('vehiculoFechaDesde').value;
    const fh = document.getElementById('vehiculoFechaHasta').value;
    let data = DB.vehiculos.filter(v => {
        const match = !q || v.marca.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q);
        const d = v.fecha_entrada;
        const okFrom = !fd || d >= fd;
        const okTo = !fh || d <= fh;
        return match && okFrom && okTo;
    });
    pagination.vehiculos = 1;
    renderTable('vehiculoTableBody', data, ['id_vehiculo','marca','modelo','fecha_entrada','coste_compra'], 'vehiculo', data.length);
}
function renderTable(tbodyId, data, cols, key, total) {
    const page = pagination[key] || 1;
    const start = (page - 1) * PAGE_SIZE;
    const paged = data.slice(start, start + PAGE_SIZE);
    const tbody = document.getElementById(tbodyId);
    const count = document.getElementById(key + 'Count');
    if (count) count.textContent = `${total} registros`;
    if (!tbody) return;
    tbody.innerHTML = paged.map(row => '<tr>' + cols.map(c => {
        let val = row[c] || '';
        if (c === 'coste_compra' || c === 'precio' || c === 'precio_venta') val = formatEur(parseFloat(val));
        if (c === 'familia') val = `<span class="badge badge-familia">${val}</span>`;
        if (c === 'canal_venta') val = `<span class="badge badge-canal">${val}</span>`;
        if (c === 'stock_disponible') val = `<span class="badge ${parseInt(val) < 5 ? 'badge-low' : 'badge-ok'}">${val}</span>`;
        return `<td>${val}</td>`;
    }).join('') + '</tr>').join('');
    renderPagination(key, data.length, page);
}
function renderPagination(key, total, current) {
    const pbar = document.getElementById(key + 'Pagination');
    if (!pbar) return;
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) { pbar.innerHTML = ''; return; }
    pbar.innerHTML = `<span>Página ${current} de ${pages}</span>
        ${current > 1 ? `<button class="pg-btn" onclick="goPage('${key}',${current-1})">‹ Anterior</button>` : ''}
        ${current < pages ? `<button class="pg-btn" onclick="goPage('${key}',${current+1})">Siguiente ›</button>` : ''}`;
}
window.goPage = function(key, page) {
    pagination[key] = page;
    if (key === 'vehiculos') applyVehiculosFilters();
    else if (key === 'recambios') applyRecambiosFilters();
    else if (key === 'ventas') applyVentasFilters();
};

// =====================================================
// 5. VISTA RECAMBIOS
// =====================================================
function renderRecambios() {
    applyRecambiosFilters();
    document.getElementById('recambioSearch').addEventListener('input', applyRecambiosFilters);
    document.getElementById('recambioFamilia').addEventListener('change', applyRecambiosFilters);
    document.getElementById('recambioCanal').addEventListener('change', applyRecambiosFilters);
    document.getElementById('recambioResetFilters').addEventListener('click', () => {
        document.getElementById('recambioSearch').value = '';
        document.getElementById('recambioFamilia').value = '';
        document.getElementById('recambioCanal').value = '';
        applyRecambiosFilters();
    });
}
function applyRecambiosFilters() {
    const q = document.getElementById('recambioSearch').value.toLowerCase();
    const fam = document.getElementById('recambioFamilia').value;
    const canal = document.getElementById('recambioCanal').value;
    let data = DB.piezas.filter(p => {
        const match = !q || p.nombre.toLowerCase().includes(q) || p.id_pieza.includes(q);
        return match && (!fam || p.familia === fam) && (!canal || p.canal_venta === canal);
    });
    pagination.recambios = 1;
    renderTable('recambioTableBody', data, ['id_pieza','nombre','familia','precio','canal_venta','stock_disponible'], 'recambio', data.length);
}

// =====================================================
// 6. VISTA VENTAS
// =====================================================
function renderVentas() {
    applyVentasFilters();
    document.getElementById('ventaSearch').addEventListener('input', applyVentasFilters);
    document.getElementById('ventaCanal').addEventListener('change', applyVentasFilters);
    document.getElementById('ventaFechaDesde').addEventListener('change', applyVentasFilters);
    document.getElementById('ventaFechaHasta').addEventListener('change', applyVentasFilters);
    document.getElementById('ventaResetFilters').addEventListener('click', () => {
        document.getElementById('ventaSearch').value = '';
        document.getElementById('ventaCanal').value = '';
        document.getElementById('ventaFechaDesde').value = '';
        document.getElementById('ventaFechaHasta').value = '';
        applyVentasFilters();
    });
}
function applyVentasFilters() {
    const q = document.getElementById('ventaSearch').value.toLowerCase();
    const canal = document.getElementById('ventaCanal').value;
    const fd = document.getElementById('ventaFechaDesde').value;
    const fh = document.getElementById('ventaFechaHasta').value;
    let data = DB.ventas.filter(v => {
        const match = !q || v.pieza_id.includes(q) || v.canal_venta.toLowerCase().includes(q);
        const d = v.fecha_venta;
        return match && (!canal || v.canal_venta === canal) && (!fd || d >= fd) && (!fh || d <= fh);
    });
    const total = data.reduce((s, v) => s + parseFloat(v.precio_venta || 0), 0);
    const tv = document.getElementById('ventaTotalValue');
    if (tv) tv.textContent = formatEur(total);
    pagination.ventas = 1;
    renderTable('ventaTableBody', data, ['id_venta','pieza_id','fecha_venta','precio_venta','canal_venta'], 'venta', data.length);
}

// =====================================================
// 7. AUTO-INSIGHTS desde datos reales
// =====================================================
function generateAutoInsights() {
    const totalIngresos = DB.ventas.reduce((s, v) => s + parseFloat(v.precio_venta || 0), 0);
    const canalTotals = {};
    DB.ventas.forEach(v => { canalTotals[v.canal_venta] = (canalTotals[v.canal_venta] || 0) + parseFloat(v.precio_venta || 0); });
    const topCanal = Object.entries(canalTotals).sort((a,b) => b[1]-a[1])[0] || ['—', 0];
    const pct = totalIngresos > 0 ? ((topCanal[1] / totalIngresos) * 100).toFixed(0) : 0;

    const piezaCount = {};
    DB.ventas.forEach(v => { piezaCount[v.pieza_id] = (piezaCount[v.pieza_id] || 0) + 1; });
    const topPiezaId = Object.entries(piezaCount).sort((a,b) => b[1]-a[1])[0]?.[0];
    const topPieza = DB.piezas.find(p => p.id_pieza === topPiezaId);

    const soldIds = new Set(DB.ventas.map(v => v.pieza_id));
    const sinVender = DB.piezas.filter(p => !soldIds.has(p.id_pieza));
    const valorSinVender = sinVender.reduce((s, p) => s + parseFloat(p.precio || 0) * parseInt(p.stock_disponible || 1), 0);

    const stockBajo = DB.piezas.filter(p => parseInt(p.stock_disponible) < 5).length;

    const insights = [
        { icon: 'ph-trend-up', type: 'up', text: `Canal <strong>${topCanal[0]}</strong> genera el <strong>${pct}%</strong> de los ingresos totales.`, prompt: `Analiza las ventas por canal de venta y muestra ranking con tabla y gráfico circular.` },
        { icon: 'ph-currency-eur', type: 'warn', text: `<strong>${formatEur(valorSinVender)}</strong> inmovilizados en ${sinVender.length} piezas sin ninguna venta.`, prompt: `Identifica todas las piezas sin vender, agrúpalas por familia y muestra tabla y gráfico de barras.` },
        { icon: 'ph-package', type: 'up', text: `Pieza más vendida: <strong>${topPieza ? topPieza.nombre : '—'}</strong> con ${piezaCount[topPiezaId] || 0} ventas registradas.`, prompt: `Genera el ranking de las 10 piezas más vendidas con tabla y gráfico de barras horizontales.` },
        { icon: 'ph-warning-circle', type: 'warn', text: `<strong>${stockBajo}</strong> referencias con stock crítico (menos de 5 unidades).`, prompt: `Muestra las piezas con stock menor a 5 unidades agrupadas por familia con tabla y gráfico.` },
        { icon: 'ph-currency-eur', type: 'up', text: `Ingresos totales registrados: <strong>${formatEur(totalIngresos)}</strong> en ${DB.ventas.length} operaciones.`, prompt: `Muestra evolución mensual de ingresos en 2025 con gráfico de líneas y tabla resumen.` }
    ];
    window._autoInsights = insights;
}

function updateRecommendations() {
    const box = document.getElementById('recommendationsList');
    if (!box || !window._autoInsights) return;
    const shuffled = [...window._autoInsights].sort(() => 0.5 - Math.random()).slice(0, 3);
    box.innerHTML = '';
    shuffled.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'recommendation-item clickable';
        const typeStyle = insight.type === 'warn' ? 'border-left-color:#f59e0b;background-color:#fffbeb;' : '';
        item.setAttribute('style', typeStyle + 'cursor:pointer;');
        item.title = 'Haz clic para ver el informe completo';
        item.innerHTML = `<i class="ph-fill ${insight.icon}"></i><div><p class="recommendation-text">${insight.text}</p><span class="recommendation-time">Haz clic para ver el informe</span></div>`;
        item.onclick = () => triggerQuickReport(insight.prompt);
        box.appendChild(item);
    });
}

// =====================================================
// 8. AI ENGINE — Prompts e Informes
// =====================================================
const COLORES = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];

// --- HELPERS PARA EL MOTOR UNIFICADO ---
function parseTimeFilter(pl) {
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const now = new Date();
    
    // Mes específico
    for (let i = 0; i < months.length; i++) {
        if (pl.includes(months[i])) return { type:'month', value:i, label: months[i].charAt(0).toUpperCase() + months[i].slice(1) };
    }
    
    if (pl.includes('este mes') || pl.includes('mes actual')) {
        return { type:'month', value:now.getMonth(), label: months[now.getMonth()] };
    }
    
    if (pl.includes('últimos 3 meses') || pl.includes('ultimo 3 mes')) {
        const start = new Date(); start.setMonth(now.getMonth() - 2);
        return { type:'range', start, end:now, label:'Últimos 3 meses' };
    }

    return { type:'all', label:'Histórico total' };
}

function parseDimension(pl) {
    if (pl.includes('por día') || pl.includes('por dia') || pl.includes('diario')) return 'day';
    if (pl.includes('por mes') || pl.includes('mensual')) return 'month';
    if (pl.includes('por canal') || pl.includes('plataforma')) return 'canal';
    if (pl.includes('por familia') || pl.includes('categoría')) return 'familia';
    if (pl.includes('por vehículo') || pl.includes('por coche')) return 'vehiculo';
    
    // Inferencia por defecto
    if (pl.includes('evolución') || pl.includes('tiempo')) return 'month';
    if (pl.includes('distribución') || pl.includes('reparto')) return 'canal';
    return 'canal';
}

function parseMetric(pl) {
    if (pl.includes('beneficio') || pl.includes('margen') || pl.includes('ganancia')) return 'beneficio';
    if (pl.includes('venta') || pl.includes('operación') || pl.includes('cantidad')) return 'ventas';
    return 'ingresos'; // por defecto
}

function interpretPrompt(pl) {
    return buildUnifiedReport(pl);
}

function buildUnifiedReport(pl) {
    const time = parseTimeFilter(pl);
    const dim = parseDimension(pl);
    const met = parseMetric(pl);
    const chart = resolveChartTypeFromPrompt(pl, dim === 'day' || dim === 'month' ? 'line' : 'bar');

    console.log(`[AI Engine] Unificando: Tiempo=${time.label}, Dimensión=${dim}, Métrica=${met}`);

    // 1. FILTRADO
    let data = [...DB.ventas];
    if (time.type === 'month') {
        data = data.filter(v => {
            const d = new Date(v.fecha_venta);
            return d.getMonth() === time.value && d.getFullYear() === 2025;
        });
    } else if (time.type === 'range') {
        data = data.filter(v => {
            const d = new Date(v.fecha_venta);
            return d >= time.start && d <= time.end;
        });
    }

    // 2. AGRUPACIÓN Y MÉTRICA
    const groups = {};
    data.forEach(v => {
        let key = 'Otros';
        const d = new Date(v.fecha_venta);
        
        if (dim === 'day') key = `${d.getDate()}/${d.getMonth()+1}`;
        else if (dim === 'month') key = d.toLocaleString('es-ES', { month: 'short' });
        else if (dim === 'canal') key = v.canal_venta;
        else if (dim === 'familia') {
            const p = DB.piezas.find(x => x.id_pieza === v.pieza_id);
            key = p ? p.familia : 'Sin familia';
        }
        else if (dim === 'vehiculo') {
            const p = DB.piezas.find(x => x.id_pieza === v.pieza_id);
            const veh = DB.vehiculos.find(x => x.id_vehiculo === p?.vehiculo_id);
            key = veh ? `${veh.marca} ${veh.modelo}` : 'Varios';
        }

        let val = 0;
        if (met === 'ingresos') val = parseFloat(v.precio_venta || 0);
        else if (met === 'ventas') val = 1;
        else if (met === 'beneficio') {
            const p = DB.piezas.find(x => x.id_pieza === v.pieza_id);
            val = parseFloat(v.precio_venta || 0) - (parseFloat(p?.precio || 0) * 0.2); // Simulación margen
        }

        groups[key] = (groups[key] || 0) + val;
    });

    // Ordenar y limitar si es ranking
    let rows = Object.entries(groups);
    if (dim !== 'day' && dim !== 'month') {
        rows.sort((a,b) => b[1] - a[1]);
        if (pl.includes('top')) rows = rows.slice(0, 10);
    } else {
        // Orden cronológico simple para días/meses si es posible
    }

    const totalVal = rows.reduce((s,[,v]) => s+v, 0);
    const metricLabel = met === 'ingresos' ? 'Ingresos (€)' : (met === 'ventas' ? 'Ventas (ud)' : 'Beneficio (€)');

    const finalTitle = `Análisis de ${metricLabel} ${dim === 'canal' ? 'por Canal' : 'por ' + dim} (${time.label})`;
    
    // Coherencia visual
    let conclusions = `El análisis de <strong>${time.label}</strong> muestra un total de <strong>${met === 'ventas' ? totalVal : formatEur(totalVal)}</strong>. `;
    if (rows.length > 0) {
        conclusions += `El valor más alto se encuentra en <strong>${rows[0][0]}</strong>.`;
    }
    if (chart === 'doughnut' && rows.length > 10) {
        conclusions += `<br/><br/>⚠️ <em>Nota: Un gráfico circular con más de 10 elementos puede ser difícil de leer. Se recomienda usar barras.</em>`;
    }

    return {
        title: finalTitle,
        summary: `Informe dinámico generado tras analizar ${data.length} registros del periodo ${time.label}. Agrupado por ${dim}.`,
        metrics: [
            { title: met === 'ventas' ? 'Volumen Total' : 'Valor Total', value: met === 'ventas' ? totalVal : formatEur(totalVal), icon: 'ph-chart-line-up', trend:'neutral', trendValue: time.label },
            { title: 'Operaciones', value: data.length, icon: 'ph-receipt', trend:'neutral', trendValue: 'En periodo' }
        ],
        table: { 
            headers: [dim.charAt(0).toUpperCase() + dim.slice(1), metricLabel, '% del total'], 
            rows: rows.map(([k,v]) => [k, met === 'ventas' ? v : formatEur(v), totalVal > 0 ? ((v/totalVal)*100).toFixed(1)+'%' : '0%']) 
        },
        chartConfig: { 
            labels: rows.map(r=>r[0]), 
            datasets: [{ 
                label: metricLabel, 
                data: rows.map(r=>r[1].toFixed(2)), 
                backgroundColor: chart === 'line' ? 'rgba(59,130,246,0.1)' : COLORES, 
                borderColor: chart === 'line' ? '#3b82f6' : 'white',
                fill: chart === 'line',
                borderRadius: 6,
                tension: 0.4
            }] 
        },
        chartType: chart,
        conclusions: conclusions,
        relatedIds: ['ventas_mes', 'stock_actual']
    };
}

function buildVehiculosReport(pl) {
    const vehiculosConBeneficio = DB.vehiculos.map(v => {
        const piezasV = DB.piezas.filter(p => p.vehiculo_id === v.id_vehiculo);
        const ventasV = DB.ventas.filter(ve => piezasV.some(p => p.id_pieza === ve.pieza_id));
        const ingresos = ventasV.reduce((s, ve) => s + parseFloat(ve.precio_venta || 0), 0);
        const beneficio = ingresos - parseFloat(v.coste_compra || 0);
        return { ...v, beneficio };
    });

    const groups = {};
    vehiculosConBeneficio.forEach(v => {
        const key = `${v.marca} ${v.modelo}`;
        groups[key] = (groups[key] || 0) + v.beneficio;
    });

    let rows = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
        title: 'Beneficio por Vehículo',
        summary: `Análisis de margen bruto (Ventas - Coste adquis.) para los vehículos en stock.`,
        metrics: [{ title: 'Vehículo más rentable', value: rows[0]?.[0]||'—', icon:'ph-star', trend:'up', trendValue:formatEur(rows[0]?.[1]||0) }],
        table: { headers: ['Vehículo','Margen Estimado (€)'], rows: rows.map(([k,v])=>[k, formatEur(v)]) },
        chartConfig: { labels: rows.map(r=>r[0]), datasets:[{ label:'Margen', data:rows.map(r=>r[1]), backgroundColor:'#8b5cf6', borderRadius:4 }] },
        chartType: 'bar',
        conclusions: `Los vehículos de marca <strong>${rows[0]?.[0].split(' ')[0]}</strong> generan el mejor margen.`,
        relatedIds: ['ventas_mes','piezas_top']
    };
}

function buildMensualReport(pl) { return buildUnifiedReport(pl); }

/**
 * Detecta inteligentemente el tipo de gráfico basado en el prompt del usuario.
 * @param {string} pl Prompt en minúsculas
 * @param {string} defaultType Tipo por defecto del informe
 */
function resolveChartTypeFromPrompt(pl, defaultType) {
    console.log(`[AI Debug] Detectando tipo de gráfico para: "${pl}"`);
    
    // Prioridad absoluta a palabras clave explícitas
    if (pl.includes('circular') || pl.includes('quesito') || pl.includes('pie') || pl.includes('tarta') || pl.includes('donut') || pl.includes('doughnut')) {
        return 'doughnut';
    }
    if (pl.includes('barras')) {
        if (pl.includes('horizontal')) return 'bar-horizontal';
        return 'bar';
    }
    if (pl.includes('línea') || pl.includes('linea') || pl.includes('evolución') || pl.includes('evolucion') || pl.includes('tendencia')) {
        return 'line';
    }
    
    // Inferencias basadas en el tipo de análisis si no se especifica tipo de gráfico
    if (pl.includes('distribución') || pl.includes('distribucion') || pl.includes('porcentaje')) return 'doughnut';
    if (pl.includes('comparativa') || pl.includes('ranking')) return 'bar';

    return defaultType;
}

// =====================================================
// 9. RENDERIZADO DE INFORME
// =====================================================
function renderReport(data) {
    currentReportData = data;
    reportTitle.textContent = data.title;
    reportSummaryText.textContent = data.summary;

    metricsContainer.innerHTML = data.metrics.map(m => {
        const trendIcon = m.trend==='up'?'ph-trend-up':(m.trend==='down'?'ph-trend-down':'ph-minus');
        const trendClass = m.trend==='up'?'trend-up':(m.trend==='down'?'trend-down':'');
        return `<div class="metric-card"><div class="metric-card-header"><span class="metric-title">${m.title}</span><i class="ph ${m.icon} metric-icon"></i></div><div class="metric-value">${m.value}</div><div class="metric-trend ${trendClass}"><i class="ph ${trendIcon}"></i><span>${m.trendValue}</span></div></div>`;
    }).join('');

    tableHeadRow.innerHTML = data.table.headers.map(h=>`<th>${h}</th>`).join('');
    tableBody.innerHTML = data.table.rows.map(row=>'<tr>'+row.map(c=>`<td>${c}</td>`).join('')+'</tr>').join('');

    const cd = document.getElementById('chartContainerDiv');
    if (data.chartType === 'none' || !data.chartConfig) {
        if (cd) cd.classList.add('hidden');
    } else {
        if (cd) cd.classList.remove('hidden');
        if (chartInstance) chartInstance.destroy();
        const ctx = document.getElementById('mainChart').getContext('2d');
        let type = data.chartType;
        const opts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } };
        if (type === 'bar-horizontal') { type='bar'; opts.indexAxis='y'; }
        if (type !== 'doughnut' && type !== 'pie') opts.scales = { y:{ beginAtZero:true } };
        else opts.cutout = '55%';
        chartInstance = new Chart(ctx, { type, data: data.chartConfig, options: opts });
    }

    reportConclusionsText.innerHTML = data.conclusions || '';
    renderRelatedReports(data.relatedIds || []);
    document.getElementById('exportActions') && document.getElementById('exportActions').classList.remove('hidden');
}

function renderRelatedReports(relatedIds) {
    if (!relatedWidgetsGrid || !relatedReportsContainer) return;
    const toRender = (relatedIds||[]).map(id=>widgetCatalog.find(w=>w.id===id)).filter(Boolean).slice(0,3);
    if (!toRender.length) { relatedReportsContainer.classList.add('hidden'); return; }
    relatedReportsContainer.classList.remove('hidden');
    relatedWidgetsGrid.innerHTML = '';
    toRender.forEach((w,idx) => {
        const cid = `rt_${w.id}_${Date.now()}_${idx}`;
        const card = document.createElement('div');
        card.className = 'widget-card';
        card.onclick = () => triggerQuickReport(w.prompt);
        card.innerHTML = `<div class="widget-content"><h4>${w.title}</h4><p>${w.desc}</p><div class="widget-thumbnail"><canvas id="${cid}"></canvas></div></div><div class="widget-action"><span>Ver informe</span><i class="ph-bold ph-arrow-right"></i></div>`;
        relatedWidgetsGrid.appendChild(card);
        setTimeout(() => {
            const c = document.getElementById(cid); if (!c) return;
            let t = w.chartType === 'bar-horizontal' ? 'bar' : w.chartType;
            const o = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, animation:{duration:500}, scales:{} };
            if (t==='bar') o.scales = { x:{display:false}, y:{display:false,beginAtZero:true} };
            new Chart(c.getContext('2d'), { type:t, data:w.chartData, options:o });
        }, 100);
    });
}

// =====================================================
// 10. WIDGET CATALOG + THUMBNAILS
// =====================================================
const widgetCatalog = [
    { id:'ventas_mes', title:'Ventas del mes', desc:'resumen de ventas actuales', prompt:'Genera un informe de todas las ventas realizadas durante el mes actual con gráfico de barras.', chartType:'bar', chartData:{labels:['S1','S2','S3','S4'],datasets:[{data:[10,12,9,14],backgroundColor:'#3b82f6',borderRadius:4}]} },
    { id:'stock_actual', title:'Stock actual', desc:'distribución del inventario por familia', prompt:'Muestra el stock disponible agrupado por familia con gráfico circular.', chartType:'doughnut', chartData:{labels:['Mec.','Car.','Int.','Elec.'],datasets:[{data:[40,30,15,15],backgroundColor:COLORES,borderWidth:0}]} },
    { id:'piezas_top', title:'Piezas más vendidas', desc:'ranking de piezas con mayor rotación', prompt:'Genera ranking de piezas más vendidas con gráfico de barras horizontales.', chartType:'bar', chartData:{labels:['Faros','Alt.','Retro.'],datasets:[{data:[30,22,18],backgroundColor:'#10b981',borderRadius:4}]} },
    { id:'vehiculos_rentables', title:'Vehículos más rentables', desc:'beneficio por vehículo', prompt:'Analiza beneficio por vehículo con gráfico de barras.', chartType:'bar', chartData:{labels:['SEAT','VW','Peu.'],datasets:[{data:[45,38,31],backgroundColor:'#8b5cf6',borderRadius:4}]} },
    { id:'piezas_muertas', title:'Piezas sin rotación', desc:'piezas que no se venden', prompt:'Identifica piezas sin vender con gráfico de barras.', chartType:'bar', chartData:{labels:['Asientos','Puertas'],datasets:[{data:[42,18],backgroundColor:'#ef4444',borderRadius:4}]} },
    { id:'ventas_canal', title:'Ventas por canal', desc:'análisis por plataforma de venta', prompt:'Analiza las ventas por canal de venta con tabla y gráfico circular.', chartType:'doughnut', chartData:{labels:['eBay','Wallapop','Ovoko'],datasets:[{data:[35,30,20],backgroundColor:COLORES,borderWidth:0}]} }
];

function renderWidgetThumbnails() {
    const map = { thumbVentas:'ventas_mes', thumbStock:'stock_actual', thumbPiezasTop:'piezas_top', thumbVehiculosRentables:'vehiculos_rentables', thumbPiezasMuertas:'piezas_muertas' };
    Object.entries(map).forEach(([cid,wid]) => {
        const canvas = document.getElementById(cid);
        const w = widgetCatalog.find(x=>x.id===wid);
        if (!canvas || !w) return;
        const opts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, animation:{duration:700}, scales:{} };
        let type = w.chartType;
        if (type==='bar-horizontal'){type='bar';opts.indexAxis='y';}
        if (type!=='doughnut') opts.scales={x:{display:false},y:{display:false}};
        new Chart(canvas.getContext('2d'), {type, data:w.chartData, options:opts});
    });
}

// =====================================================
// 11. MAIN GENERATE BUTTON
// =====================================================
generateBtn.addEventListener('click', () => {
    const raw = promptInput.value.trim();
    if (!raw) { alert('Escribe qué informe necesitas.'); return; }
    const pl = raw.toLowerCase();

    // Auto-export triggers
    const wantsPdf = pl.includes('pdf') || pl.includes('exportar') && pl.includes('informe');
    const wantsCsv = pl.includes('csv') || pl.includes('descargar');

    reportContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    generateBtn.disabled = true;

    setTimeout(() => {
        let data = interpretPrompt(pl);
        
        // --- PRIORIDAD DEL USUARIO (CRÍTICO) ---
        // Extraemos el tipo de gráfico detectado del texto ACTUAL del input
        const userChartType = resolveChartTypeFromPrompt(pl, data.chartType);
        data.chartType = userChartType;
        
        console.log(`[AI Debug] Generando informe: "${data.title}" con gráfico: ${data.chartType}`);

        renderReport(data);
        loadingState.classList.add('hidden');
        reportContainer.classList.remove('hidden');
        generateBtn.disabled = false;
        reportContainer.scrollIntoView({behavior:'smooth', block:'start'});
        if (wantsPdf) setTimeout(exportToPDF, 600);
        else if (wantsCsv) exportToCSV();
    }, Math.random()*800+1200);
});

window.triggerQuickReport = function(text) {
    promptInput.value = text;
    navigateTo('bi');
    setTimeout(() => generateBtn.click(), 300);
};

// =====================================================
// 12. EXPORT PDF
// =====================================================
async function exportToPDF() {
    if (!currentReportData) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const margin = 15, width = 180;
    let y = 15;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('DesguacePro', margin, 12);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Sistema de Gestión Inteligente de Desguace', margin, 20);
    doc.text(new Date().toLocaleDateString('es-ES', {day:'2-digit',month:'long',year:'numeric'}), 210-margin, 20, {align:'right'});

    y = 42;
    doc.setTextColor(0,0,0);
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text(currentReportData.title, margin, y); y += 8;

    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.setTextColor(80,80,80);
    const lines = doc.splitTextToSize(currentReportData.summary, width);
    doc.text(lines, margin, y); y += lines.length * 5 + 5;

    // Chart image
    const chartCanvas = document.getElementById('mainChart');
    if (chartCanvas && currentReportData.chartType !== 'none') {
        try {
            const imgData = chartCanvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', margin, y, width, 70); y += 75;
        } catch(e) {}
    }

    // Table
    if (currentReportData.table) {
        const headers = currentReportData.table.headers;
        const rows = currentReportData.table.rows.slice(0, 25);
        doc.setFontSize(9); doc.setFont('helvetica','bold');
        const colW = width / headers.length;
        doc.setFillColor(245,247,250);
        doc.rect(margin, y, width, 7, 'F');
        headers.forEach((h,i) => doc.text(String(h), margin + i*colW + 1, y+5));
        y += 8; doc.setFont('helvetica','normal');
        rows.forEach((row, ri) => {
            if (ri % 2 === 0) { doc.setFillColor(252,252,252); doc.rect(margin,y,width,6,'F'); }
            row.forEach((c,i) => doc.text(String(c).substring(0,18), margin + i*colW + 1, y+4));
            y += 6; if (y > 270) { doc.addPage(); y = 20; }
        });
        y += 4;
    }

    // Conclusions
    if (currentReportData.conclusions && y < 260) {
        doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(37,99,235);
        doc.text('Conclusiones IA', margin, y); y += 6;
        doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.setFontSize(9);
        const cLines = doc.splitTextToSize(currentReportData.conclusions.replace(/<[^>]+>/g,''), width);
        doc.text(cLines, margin, y);
    }

    // Footer
    doc.setFillColor(37,99,235);
    doc.rect(0,287,210,10,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(8);
    doc.text('DesguacePro © 2025 | Generado con IA', 105, 293.5, {align:'center'});

    doc.save(`informe_desguace_${new Date().toISOString().split('T')[0]}.pdf`);
}

// =====================================================
// 13. EXPORT CSV
// =====================================================
function exportToCSV() {
    if (!currentReportData) return;
    const { headers, rows } = currentReportData.table;
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff'+csvContent], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url;
    a.download = `informe_desguace_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
}

// Export buttons
document.getElementById('rptExportPdf')?.addEventListener('click', exportToPDF);
document.getElementById('rptExportCsv')?.addEventListener('click', exportToCSV);
document.getElementById('exportPdfBtn')?.addEventListener('click', exportToPDF);
document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCSV);

// =====================================================
// 14. UTILTITIES
// =====================================================
function formatEur(n) {
    if (isNaN(n)) return '0€';
    return Number(n).toLocaleString('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:0});
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('bi');
    initDataEngine();
});
