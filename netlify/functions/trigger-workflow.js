const fetch = require('node-fetch');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        const body = querystring.parse(event.body);

        const filename = body.filename;
        const content = body.content;

        const repo = 'Basermc/batalla'; // Reemplaza con tu nombre de repositorio
        const workflow = 'save-results.yml'; // Reemplaza con tu archivo de workflow
        
        try {
            // Enviar una solicitud para ejecutar el workflow
            const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${process.env.GH_TOKEN}`, // Usa tu token de GitHub aquí
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: 'main', // Cambia si es necesario
                    inputs: { filename, content }
                })
            });

            if (response.ok) {
                return {
                    statusCode: 200,
                    body: 'Workflow triggered successfully.'
                };
            } else {
                const errorText = await response.text();
                return {
                    statusCode: response.status,
                    body: `Failed to trigger workflow: ${errorText}`
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: `Error: ${error.message}`
            };
        }
    } else {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }
};
