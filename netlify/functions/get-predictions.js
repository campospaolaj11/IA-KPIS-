// Netlify Function: get-predictions.js
exports.handler = async function(event, context) {
  // Simulación de predicciones recientes
  const predictions = [
    {
      id: 1,
      codigo_equipo: 'CAM-001',
      nombre_equipo: 'Camión Minero',
      componente: 'Motor Diesel',
      probabilidad: 0.87,
      accion: 'Revisar y reemplazar filtro de aceite.',
      fecha: new Date().toISOString()
    },
    {
      id: 2,
      codigo_equipo: 'GEN-005',
      nombre_equipo: 'Generador Eléctrico',
      componente: 'Sistema Hidráulico',
      probabilidad: 0.78,
      accion: 'Inspeccionar presión del sistema.',
      fecha: new Date().toISOString()
    }
  ];
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, predictions })
  };
};
// Netlify Function: get-predictions.js
exports.handler = async function(event, context) {
  // Simulación de predicciones recientes
  const predictions = [
    {
      id: 1,
      codigo_equipo: 'CAM-001',
      nombre_equipo: 'Camión Minero',
      componente: 'Motor Diesel',
      probabilidad: 0.87,
      riesgo: 'ALTO',
      dias_falla: 5,
      accion: 'Reemplazar filtro de aceite.'
    },
    {
      id: 2,
      codigo_equipo: 'GEN-005',
      nombre_equipo: 'Generador Eléctrico',
      componente: 'Sistema Hidráulico',
      probabilidad: 0.78,
      riesgo: 'MEDIO',
      dias_falla: 12,
      accion: 'Inspeccionar presión.'
    }
  ];
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: predictions })
  };
};
