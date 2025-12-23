// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://kgjvxmhkswgqihoxpgsr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HSsEww4KyjlTPngBGSX6Pg_gtyhjlSC';

// Cargar el cliente de Supabase si no está presente
if (typeof window.createClient === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    script.onload = () => { window.supabase = window.createClient(SUPABASE_URL, SUPABASE_KEY); };
    document.head.appendChild(script);
} else {
    window.supabase = window.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ==================== LOAD KPIs ====================
async function loadKPIs() {
    try {
        // Esperar a que el cliente de Supabase esté disponible
        while (!window.supabase) { await new Promise(r => setTimeout(r, 100)); }
        // Leer la tabla "kpis"
        const { data, error } = await window.supabase
            .from('kpis')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);
        if (error) {
            console.error('Error al cargar KPIs:', error.message);
            return;
        }
        if (data && data.length > 0) {
            renderKPIs(data[0]);
        } else {
            console.warn('No hay datos de KPIs en Supabase.');
        }
    } catch (error) {
        console.error('Error en la petición de KPIs:', error);
    }
}

function renderKPIs(kpis) {
    const kpiGrid = document.getElementById('kpis');
    if (!kpiGrid) return;
    
    kpiGrid.innerHTML = `
        <!-- MTBF -->
        <div class="kpi-card success">
            <div class="kpi-header">
                <span class="kpi-title">MTBF</span>
                <span class="kpi-icon">1e0f</span>
            </div>
            <div class="kpi-value">${kpis.MTBF ? kpis.MTBF.toFixed(2) : '0'}</div>
            <div class="kpi-subtitle">Horas entre fallas</div>
            <div class="kpi-trend up">
                <i class="fas fa-arrow-up"></i>
                <span>3ptimo</span>
            </div>
        </div>
        
        <!-- MTTR -->
        <div class="kpi-card warning">
            <div class="kpi-header">
                <span class="kpi-title">MTTR</span>
                <span class="kpi-icon">27</span>
            </div>
            <div class="kpi-value">${kpis.MTTR ? kpis.MTTR.toFixed(2) : '0'}</div>
            <div class="kpi-subtitle">Horas de reparacin</div>
            <div class="kpi-trend down">
                <i class="fas fa-arrow-down"></i>
                <span>Bajo control</span>
            </div>
        </div>
        
        <!-- Disponibilidad -->
        <div class="kpi-card success">
            <div class="kpi-header">
                <span class="kpi-title">Disponibilidad</span>
                <span class="kpi-icon">05</span>
            </div>
            <div class="kpi-value">${kpis.Disponibilidad ? kpis.Disponibilidad.toFixed(2) : '0'}%</div>
            <div class="kpi-subtitle">Operacional</div>
            <div class="kpi-trend up">
                <i class="fas fa-arrow-up"></i>
                <span>+2.5%</span>
            </div>
        </div>
        
        <!-- Costo Promedio -->
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Costo Promedio</span>
                <span class="kpi-icon">cb0</span>
            </div>
            <div class="kpi-value">$${kpis.CostoPromedio ? kpis.CostoPromedio.toFixed(2) : '0'}</div>
            <div class="kpi-subtitle">Por mantenimiento</div>
        </div>
        
        <!-- Tasa de Fallas -->
        <div class="kpi-card danger">
            <div class="kpi-header">
                <span class="kpi-title">Tasa de Fallas</span>
                <span class="kpi-icon">ae0f</span>
            </div>
            <div class="kpi-value">${kpis.TasaFallas ? kpis.TasaFallas.toFixed(2) : '0'}%</div>
            <div class="kpi-subtitle">De los mantenimientos</div>
        </div>
    `;
}

// ==================== LOAD ALERTS ====================
async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/predictions/alerts`);
        const data = await response.json();
        
        if (data.success) {
            renderAlerts(data.data);
        } else {
            console.error('Error al cargar alertas:', data.error);
        }
    } catch (error) {
        console.error('Error en la peticin de alertas:', error);
    }
}

function renderAlerts(alerts) {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<p class="text-center">No hay alertas de alto riesgo en este momento</p>';
        return;
    }
    
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-icon">ea8</div>
            <div class="alert-content">
                <div class="alert-title">${alert.codigo_equipo} - ${alert.nombre_equipo}</div>
                <div class="alert-description">
                    ${alert.componente} - Probabilidad: ${(alert.probabilidad * 100).toFixed(1)}%
                    <br>
                    ${alert.accion}
                </div>
            </div>
            <span class="alert-badge high">ALTO</span>
        </div>
    `).join('');
}

// ==================== LOAD PREDICTIONS ====================
async function loadPredictions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/predictions`);
        const data = await response.json();
        
        if (data.success) {
            renderPredictions(data.data);
        } else {
            console.error('Error al cargar predicciones:', data.error);
        }
    } catch (error) {
        console.error('Error en la peticin de predicciones:', error);
    }
}

function renderPredictions(predictions) {
    const tbody = document.getElementById('predictions-tbody');
    if (!tbody) return;
    
    if (predictions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay predicciones disponibles</td></tr>';
        return;
    }
    
    tbody.innerHTML = predictions.slice(0, 20).map(pred => `
        <tr>
            <td>${pred.id || ''}</td>
            <td>${pred.codigo_equipo || ''}</td>
            <td>${pred.nombre_equipo || ''}</td>
            <td>${pred.componente || ''}</td>
            <td>${(pred.probabilidad * 100).toFixed(1) || ''}%</td>
            <td>${pred.accion || ''}</td>
            <td>${formatDate(pred.fecha)}</td>
        </tr>
    `).join('');
}

// ==================== EXPLAIN PREDICTION ====================
async function explainPrediction(predictionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/explain/${predictionId}`);
        const data = await response.json();
        
        if (data.success) {
            // Mostrar explicacin en el chat
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                
                chatMessages.innerHTML += `
                    <div class="message user">
                        <div class="message-bubble">Explica la prediccin #${predictionId}</div>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message bot">
                        <div class="message-bubble">
                            ${data.data.texto}
                            <br><br>
                            <strong>Factores principales:</strong><br>
                            ${data.data.factores}
                        </div>
                        <span class="message-time">${time}</span>
                    </div>
                `;
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            alert('No se encontr explicacin para esta prediccin');
        }
    } catch (error) {
        console.error('Error al obtener explicacin:', error);
        alert('Error al obtener la explicacin');
    }
}

// ==================== LOAD KPI TRENDS ====================
async function loadKPITrends() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/kpis/history?days=30`);
        const data = await response.json();
        
        if (data.success) {
            renderKPITrendChart(data.data);
        }
    } catch (error) {
        console.error('Error al cargar tendencias:', error);
    }
}

function renderKPITrendChart(history) {
    const canvas = document.getElementById('kpi-trend-chart');
    if (!canvas) return;
    
    // Agrupar por KPI
    const kpiData = {};
    history.forEach(item => {
        if (!kpiData[item.kpi]) {
            kpiData[item.kpi] = { dates: [], values: [] };
        }
        kpiData[item.kpi].dates.push(item.fecha);
        kpiData[item.kpi].values.push(item.valor);
    });
    
    // Colores para cada KPI (modo oscuro, alto contraste)
    const colors = {
        'MTBF': '#22d3ee', // cyan
        'MTTR': '#fbbf24', // yellow
        'Disponibilidad': '#60a5fa', // blue-light
        'CostoPromedio': '#f87171', // red-light
        'TasaFallas': '#a78bfa' // purple-light
    };
    
    const datasets = Object.keys(kpiData).map(kpi => ({
        label: kpi,
        data: kpiData[kpi].values.reverse(),
        borderColor: colors[kpi] || '#6b7280',
        backgroundColor: `${colors[kpi] || '#6b7280'}33`,
        tension: 0.4,
        fill: true
    }));
    
    const labels = kpiData[Object.keys(kpiData)[0]]?.dates.reverse().map(date => 
        new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    ) || [];
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a1a1aa' },
                    grid: { color: '#232837' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a1a1aa' },
                    grid: { color: '#232837' }
                }
            }
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num, decimals = 2) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(num) {
    return `$${formatNumber(num, 2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

