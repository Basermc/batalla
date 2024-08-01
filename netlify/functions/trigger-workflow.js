const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    let data;

    try {
        // Intentar analizar el cuerpo de la solicitud
        data = JSON.parse(event.body);

        // Verificar que los campos necesarios estén presentes
        if (!data.filename || !data.content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields: filename or content' })
            };
        }

        // Enviar solicitud a GitHub para activar el workflow
        const response = await fetch('https://api.github.com/repos/Basermc/batalla/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.everest-preview+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'save-results',
                client_payload: {
                    filename: data.filename,
                    content: data.content
                }
            })
        });

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Workflow triggered successfully' })
            };
        } else {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: 'Error triggering workflow', error: errorText })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
};
