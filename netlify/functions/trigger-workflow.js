const https = require('https');

exports.handler = async function(event, context) {
    try {
        const { filename, content } = JSON.parse(event.body);

        const options = {
            hostname: 'api.github.com',
            path: `/repos/Basermc/batalla/contents/${filename}`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.GH_TOKEN}`,
                'User-Agent': 'Netlify Function',
                'Content-Type': 'application/json'
            }
        };

        const data = JSON.stringify({
            message: `Adding ${filename}`,
            content: Buffer.from(content).toString('base64')
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
                            body: JSON.stringify({ message: 'Success' })
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
                    body: JSON.stringify({ error: e.message })
                });
            });

            req.write(data);
            req.end();
        });
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };
    }
};
