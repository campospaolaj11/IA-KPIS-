// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod === 'POST') {
    try {
      const { question } = JSON.parse(event.body || '{}');
      if (!question) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: 'No se recibió ninguna pregunta.' })
        };
      }
      // Llamada a OpenAI
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un asistente de mantenimiento predictivo industrial, responde en español.' },
            { role: 'user', content: question }
          ],
          max_tokens: 200
        })
      });
      const openaiData = await openaiRes.json();
      const answer = openaiData.choices && openaiData.choices[0] && openaiData.choices[0].message && openaiData.choices[0].message.content
        ? openaiData.choices[0].message.content.trim()
        : 'No se pudo obtener respuesta de la IA.';
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, answer })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: 'Error procesando la pregunta.' })
      };
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Método no permitido.' })
    };
  }
};
