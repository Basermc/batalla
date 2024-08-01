const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { filename, content } = JSON.parse(event.body);

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
        filename,
        content
      }
    })
  });

  if (response.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Workflow triggered successfully' })
    };
  } else {
    return {
      statusCode: response.status,
      body: JSON.stringify({ message: 'Error triggering workflow' })
    };
  }
}
