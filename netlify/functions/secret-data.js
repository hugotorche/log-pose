exports.handler = async function(event, context) {
    const apiKey = process.env.API_KEY; // Securely access your secret key
    // Perform any backend logic or API calls here using apiKey
  
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Response from Netlify function with secrets" }),
    };
  };