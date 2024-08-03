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

    // Primero, intentamos obtener el SHA del archivo para ver si ya existe
    const getOptions = {
        hostname: 'api.github.com',
        path: `/repos/Basermc/batalla/contents/${path}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'Netlify Function'
        }
    };

    try {
        const sha = await getFileSHA(getOptions);

        // Ahora que tenemos el SHA, podemos actualizar el archivo
        const putOptions = {
            hostname: 'api.github.com',
            path: `/repos/Basermc/batalla/contents/${path}`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'User-Agent': 'Netlify Function',
                'Content-Type': 'application/json'
            }
        };

        const data = JSON.stringify({
            message: `Updating ${path}`,
            content: Buffer.from(content).toString('base64'),
            sha: sha
        });

        const response = await sendRequest(putOptions, data);

        if (response.statusCode === 200) {
            return {
                statusCode: 200,
                body: 'File updated successfully'
            };
        } else {
            return {
                statusCode: response.statusCode,
                body: response.body
            };
        }
    } catch (error) {
        // Si el archivo no existe, simplemente lo creamos
        if (error.statusCode === 404) {
            const putOptions = {
                hostname: 'api.github.com',
                path: `/repos/Basermc/batalla/contents/${path}`,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': 'Netlify Function',
                    'Content-Type': 'application/json'
                }
            };

            const data = JSON.stringify({
                message: `Creating ${path}`,
                content: Buffer.from(content).toString('base64')
            });

            const response = await sendRequest(putOptions, data);

            if (response.statusCode === 201) {
                return {
                    statusCode: 200,
                    body: 'File created successfully'
                };
            } else {
                return {
                    statusCode: response.statusCode,
                    body: response.body
                };
            }
        } else {
            return {
                statusCode: error.statusCode || 500,
                body: error.body || 'Error occurred'
            };
        }
    }
};

// Función para obtener el SHA del archivo
function getFileSHA(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const fileData = JSON.parse(responseBody);
                    resolve(fileData.sha);
                } else {
                    reject({
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

        req.end();
    });
}

// Función para enviar la solicitud HTTP
function sendRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: responseBody
                });
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
}
