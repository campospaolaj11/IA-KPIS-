// netlify/functions/chat-suggestions.js
exports.handler = async function() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      suggestions: [
        "¿Cuál es el KPI actual?",
        "¿Qué equipo tiene más alertas?",
        "¿Por qué falló la predicción?"
      ]
    })
  };
};