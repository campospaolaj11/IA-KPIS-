exports.handler = async function(event, context) {
  const body = JSON.parse(event.body || '{}');
  // Simulación simple de predicción
  const probabilidad = Math.random() * 0.8 + 0.1;
  const nivel_riesgo = probabilidad > 0.7 ? 'Alto' : probabilidad > 0.4 ? 'Medio' : 'Bajo';
  const dias_estimados_falla = Math.floor(10 + Math.random() * 90);
  const accion_recomendada = nivel_riesgo === 'Alto' ? 'Realizar mantenimiento inmediato' : 'Monitorear estado';
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      prediction: {
        probabilidad,
        nivel_riesgo,
        dias_estimados_falla,
        accion_recomendada
      }
    })
  };
};