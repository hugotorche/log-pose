exports.handler = async function(event, context) {
    const MAP_TILE_TOKEN = process.env.MAP_TILE_TOKEN; // Securely access your secret key
  
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Response from Netlify function with secrets" }),
    };
  };