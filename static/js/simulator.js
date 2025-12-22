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
        `${prediction.dias_estimados_falla} ds`;
    
    document.getElementById('action-value').textContent = 
        prediction.accion_recomendada;
}

function getRiskColor(riesgo) {
    switch(riesgo) {
        case 'Alto':
            return '#ef4444';
        case 'Medio':
            return '#f59e0b';
        case 'Bajo':
            return '#10b981';
        default:
            return '#6b7280';
    }
}

// ==================== KPIs SIMULATION ====================
async function runKPIsSimulation() {
    const delayDays = document.getElementById('delay-days').value;
    const costIncrease = document.getElementById('cost-increase').value;
    
    try {
        const response = await fetch('/api/simulator/kpis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                delay_days: parseInt(delayDays),
                cost_increase: parseFloat(costIncrease)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayKPIsResults(data.kpis_simulados);
        } else {
            alert('Error en la simulacin: ' + data.error);
        }
    } catch (error) {
        console.error('Error en simulacin:', error);
        alert('Error al ejecutar la simulacin');
    }
}

function displayKPIsResults(kpis) {
    // Ocultar mensaje inicial
    document.getElementById('results-container').style.display = 'none';
    
    // Mostrar resultados
    const resultsDiv = document.getElementById('kpis-results');
    resultsDiv.style.display = 'block';
    
    // Crear grfico de comparacin
    createComparisonChart(kpis);
}

function createComparisonChart(kpis) {
    const canvas = document.getElementById('kpi-comparison-chart');
    
    // Destruir grfico anterior si existe
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
            try {
                const response = await fetch('/.netlify/functions/simulator-predict', {
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
                    alert('Error en la simulación: ' + (data.error || 'Sin respuesta del servidor'));
                }
            } catch (error) {
                console.error('Error en simulación:', error);
                alert('Error al ejecutar la simulación');
            }
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                try {
                    const response = await fetch('/.netlify/functions/simulator-kpis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            delay_days: parseInt(delayDays),
                            cost_increase: parseFloat(costIncrease)
                        })
                    });
                    const data = await response.json();
                    if (data.success) {
                        displayKPIsResults(data.kpis_simulados);
                    } else {
                        alert('Error en la simulación: ' + (data.error || 'Sin respuesta del servidor'));
                    }
                } catch (error) {
                    console.error('Error en simulación:', error);
                    alert('Error al ejecutar la simulación');
                }
                                        break;
                                    case 'costo':
                                        change = kpis.costo.cambio;
                                        break;
                                }
                                
                                label += ` (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`;
                            }
                            
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}

// ==================== RESET SIMULATION ====================
function resetSimulation() {
    // Resetear sliders
    document.getElementById('kilometraje').value = 50000;
    document.getElementById('horas-operacion').value = 5000;
    document.getElementById('dias-mant').value = 30;
    document.getElementById('vida-util').value = 50;
    document.getElementById('delay-days').value = 0;
    document.getElementById('cost-increase').value = 0;
    
    // Actualizar valores mostrados
    updateSliderValue('kilometraje');
    updateSliderValue('horas-operacion');
    updateSliderValue('dias-mant');
    updateSliderValue('vida-util');
    updateSliderValue('delay-days');
    updateSliderValue('cost-increase');
    
    // Ocultar resultados
    document.getElementById('prediction-results').style.display = 'none';
    document.getElementById('kpis-results').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
}

