// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://kgjvxmhkswgqihoxpgsr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HHsEww4KyjlTPngBGSX6Pg_gtyhjlSC';

if (typeof window.createClient === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    script.onload = () => { window.supabase = window.createClient(SUPABASE_URL, SUPABASE_KEY); };
    document.head.appendChild(script);
} else {
    window.supabase = window.createClient(SUPABASE_URL, SUPABASE_KEY);
}
// ==================== SIMULATOR CONFIGURATION ====================
let comparisonChart = null;

// ==================== TOGGLE SIMULATION TYPE ====================
function toggleSimulationType() {
    const simType = document.getElementById('sim-type').value;
    const predictionInputs = document.getElementById('prediction-sim-inputs');
    const kpisInputs = document.getElementById('kpis-sim-inputs');
    const predictionResults = document.getElementById('prediction-results');
    const kpisResults = document.getElementById('kpis-results');
    
    if (simType === 'prediction') {
        predictionInputs.style.display = 'block';
        kpisInputs.style.display = 'none';
        predictionResults.style.display = 'none';
        kpisResults.style.display = 'none';
    } else {
        predictionInputs.style.display = 'none';
        kpisInputs.style.display = 'block';
        predictionResults.style.display = 'none';
        kpisResults.style.display = 'none';
    }
    
    // Resetear resultados
    document.getElementById('results-container').style.display = 'block';
}

// ==================== UPDATE SLIDER VALUES ====================
function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(`${sliderId}-value`);
    
    let displayValue;
    switch(sliderId) {
        case 'kilometraje':
            displayValue = `${parseInt(slider.value).toLocaleString('es-ES')} km`;
            break;
        case 'horas-operacion':
            displayValue = `${parseInt(slider.value).toLocaleString('es-ES')} hrs`;
            break;
        case 'dias-mant':
        case 'delay-days':
            displayValue = `${slider.value} ds`;
            break;
        case 'vida-util':
        case 'cost-increase':
            displayValue = `${slider.value}%`;
            break;
        default:
            displayValue = slider.value;
    }
    
    valueSpan.textContent = displayValue;
}

// ==================== RUN SIMULATION ====================
async function runSimulation() {
    const simType = document.getElementById('sim-type').value;
    
    if (simType === 'prediction') {
        await runPredictionSimulation();
    } else {
        await runKPIsSimulation();
    }
}

// ==================== PREDICTION SIMULATION ====================
async function runPredictionSimulation() {
    const equipoId = document.getElementById('equipo-select').value;
    const componenteId = document.getElementById('componente-select').value;
    const kilometraje = document.getElementById('kilometraje').value;
    const horasOperacion = document.getElementById('horas-operacion').value;
    const diasMant = document.getElementById('dias-mant').value;
    const vidaUtil = document.getElementById('vida-util').value;
    
    try {
        const response = await fetch('/api/simulator/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                equipo_id: parseInt(equipoId),
                componente_id: parseInt(componenteId),
                kilometraje: parseInt(kilometraje),
                horas_operacion: parseInt(horasOperacion),
                dias_desde_mant: parseInt(diasMant),
                porcentaje_vida_util: parseInt(vidaUtil)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayPredictionResults(data.prediction);
        } else {
            alert('Error en la simulacin: ' + data.error);
        }
    } catch (error) {
        console.error('Error en simulacin:', error);
        alert('Error al ejecutar la simulacin');
    }
}

function displayPredictionResults(prediction) {
    // Ocultar mensaje inicial
    document.getElementById('results-container').style.display = 'none';
    // Mostrar resultados
    const resultsDiv = document.getElementById('prediction-results');
    resultsDiv.style.display = 'block';
    // Actualizar valores
    document.getElementById('prob-value').textContent = 
        `${(prediction.probabilidad * 100).toFixed(1)}%`;
    const riskValue = document.getElementById('risk-value');
    riskValue.textContent = prediction.nivel_riesgo;
    riskValue.style.color = getRiskColor(prediction.nivel_riesgo);
    document.getElementById('days-value').textContent = 
        `${prediction.dias_estimados_falla} días`;
    document.getElementById('action-value').textContent = 
        prediction.accion_recomendada;
    // Mostrar historial
    loadSimulationHistory();
}

function getRiskColor(riesgo) {
    switch (riesgo) {
        case 'Alto':
            return 'red';
        case 'Medio':
            return 'orange';
        case 'Bajo':
            return 'green';
        default:
            return 'gray';
    }
}

// Async simulation logic moved here
async function runSimulation(equipoId, componenteId, kilometraje, horasOperacion, diasMant, vidaUtil) {
    try {
        while (!window.supabase) { await new Promise(r => setTimeout(r, 100)); }
        // Simulación simple en frontend (puedes mejorar la lógica)
        const probabilidad = Math.random() * 0.8 + 0.1;
        const nivel_riesgo = probabilidad > 0.7 ? 'Alto' : probabilidad > 0.4 ? 'Medio' : 'Bajo';
        const dias_estimados_falla = Math.floor(10 + Math.random() * 90);
        const accion_recomendada = nivel_riesgo === 'Alto' ? 'Realizar mantenimiento inmediato' : 'Monitorear estado';

        // Guardar simulación en Supabase
        const { error } = await window.supabase
            .from('simulaciones')
            .insert([{
                tipo: 'prediction',
                equipo_id: parseInt(equipoId),
                componente_id: parseInt(componenteId),
                kilometraje: parseInt(kilometraje),
                horas_operacion: parseInt(horasOperacion),
                dias_desde_mant: parseInt(diasMant),
                porcentaje_vida_util: parseInt(vidaUtil),
                probabilidad,
                nivel_riesgo,
                dias_estimados_falla,
                accion_recomendada,
                fecha: new Date().toISOString()
            }]);
        if (error) {
            alert('Error al guardar simulación en Supabase: ' + error.message);
            return;
        }
        displayPredictionResults({ probabilidad, nivel_riesgo, dias_estimados_falla, accion_recomendada });
    } catch (error) {
        console.error('Error en simulación:', error);
        alert('Error al ejecutar la simulación');
    }
}

function displayKPIsResults(kpis) {
    // Ocultar mensaje inicial
    document.getElementById('results-container').style.display = 'none';
    // Mostrar resultados
    const resultsDiv = document.getElementById('kpis-results');
    resultsDiv.style.display = 'block';
    // Crear gráfico de comparación
    createComparisonChart(kpis);
    // Mostrar historial
    loadSimulationHistory();
}

function createComparisonChart(kpis) {
    const canvas = document.getElementById('kpi-comparison-chart');
    // Destruir gráfico anterior si existe
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    const labels = ['MTBF', 'MTTR', 'Disponibilidad', 'Costo'];
    const actualData = [
        kpis.mtbf.actual,
        kpis.mttr.actual,
        kpis.disponibilidad.actual,
        kpis.costo.actual
    ];
    const simuladoData = [
        kpis.mtbf.simulado,
        kpis.mttr.simulado,
        kpis.disponibilidad.simulado,
        kpis.costo.simulado
    ];
    comparisonChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual',
                    data: actualData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Simulado',
                    data: simuladoData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Comparación de KPIs - Actual vs Simulado',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// ==================== LOAD SIMULATION HISTORY ====================
async function loadSimulationHistory() {
    while (!window.supabase) { await new Promise(r => setTimeout(r, 100)); }
    const { data, error } = await window.supabase
        .from('simulaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(10);
    let historyDiv = document.getElementById('history-container');
    if (!historyDiv) {
        // Insertar el historial debajo de los resultados
        let panel = document.querySelector('.simulator-panel:last-of-type');
        if (!panel) return;
        historyDiv = document.createElement('div');
        historyDiv.id = 'history-container';
        historyDiv.style.marginTop = '2rem';
        historyDiv.innerHTML = '<p style="color:#a1a1aa;">Cargando historial...</p>';
        panel.appendChild(historyDiv);
    }
    if (error) {
        historyDiv.innerHTML = '<p style="color:#ef4444;">Error al cargar historial</p>';
        return;
    }
    if (!data || data.length === 0) {
        historyDiv.innerHTML = '<p style="color:#a1a1aa;">No hay simulaciones previas.</p>';
        addClearHistoryButton();
        return;
    }
    historyDiv.innerHTML = data.map(sim => `
        <div style=\"background:#232837;padding:1rem;border-radius:0.5rem;margin-bottom:0.5rem;\">
            <strong>${sim.tipo === 'prediction' ? 'Predicción' : 'KPIs'}</strong> - <span style=\"color:#a1a1aa;\">${new Date(sim.fecha).toLocaleString('es-ES')}</span><br>
            ${sim.tipo === 'prediction' ? `
                <span>Equipo: ${sim.equipo_id || '-'} | Componente: ${sim.componente_id || '-'} | Prob: ${(sim.probabilidad*100).toFixed(1)}% | Riesgo: ${sim.nivel_riesgo || '-'}</span>
            ` : `
                <span>MTBF: ${sim.mtbf_simulado?.toFixed(1) || '-'} | MTTR: ${sim.mttr_simulado?.toFixed(1) || '-'} | Disp: ${sim.disponibilidad_simulado?.toFixed(1) || '-'}% | Costo: $${sim.costo_simulado?.toFixed(2) || '-'}</span>
            `}
        </div>
    `).join('');
    addClearHistoryButton();
}

// Botón para limpiar historial
function addClearHistoryButton() {
    let historyDiv = document.getElementById('history-container');
    if (!historyDiv || document.getElementById('clear-history-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'clear-history-btn';
    btn.textContent = 'Limpiar historial';
    btn.style = 'margin-bottom:1rem;background:#ef4444;color:#fff;border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-weight:600;float:right;';
    btn.onclick = clearSimulationHistory;
    historyDiv.prepend(btn);
}

async function clearSimulationHistory() {
    if (!confirm('¿Seguro que deseas borrar todo el historial de simulaciones?')) return;
    while (!window.supabase) { await new Promise(r => setTimeout(r, 100)); }
    const { error } = await window.supabase.from('simulaciones').delete().neq('id', 0); // Borra todos los registros
    if (error) {
        alert('Error al borrar historial: ' + error.message);
        return;
    }
    loadSimulationHistory();
}

