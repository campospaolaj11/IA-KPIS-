exports.handler = async function(event, context) {
  const body = JSON.parse(event.body || '{}');
  // Simulación simple de KPIs
  const mtbf = {
    actual: 120,
    simulado: 120 - body.delay_days * 2,
    cambio: -body.delay_days * 2 / 120 * 100
  };
  const mttr = {
    actual: 8,
    simulado: 8 + body.delay_days * 0.2,
    cambio: body.delay_days * 0.2 / 8 * 100
  };
  const disponibilidad = {
    actual: 98,
    simulado: 98 - body.delay_days * 0.3,
    cambio: -body.delay_days * 0.3 / 98 * 100
  };
  const costo = {
    actual: 5000,
    simulado: 5000 + body.cost_increase * 50,
    cambio: body.cost_increase * 50 / 5000 * 100
  };
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      kpis_simulados: { mtbf, mttr, disponibilidad, costo }
    })
  };
};