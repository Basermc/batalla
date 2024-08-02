const https = require('https');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const body = new URLSearchParams(event.body);
    const filename = body.get('filename');
    const content = body.get('content');

    if (!filename || !content) {
        return {
            statusCode: 400,
            body: 'Bad Request: Missing filename or content'
        };
    }

    // Obtener la fecha actual y formatearla
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)}`;
    const path = `puntuaciones/${formattedDate}/${filename}`;

    // Configuración para la API de GitHub
    const options = {
        hostname: 'api.github.com',
        path: `/repos/Basermc/batalla/contents/${path}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${process.env.GH_TOKEN}`,
            'User-Agent': 'Netlify Function',
            'Content-Type': 'application/json'
        }
    };

    const data = JSON.stringify({
        message: `Adding ${path} to resultados branch`,
        content: Buffer.from(content).toString('base64'),
        branch: 'resultados'  // Especificar la rama en la que hacer el commit
    });

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve({
                        statusCode: 200,
                        body: 'Success'
                    });
                } else {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseBody
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject({
                statusCode: 500,
                body: e.message
            });
        });

        req.write(data);
        req.end();
    });
};
