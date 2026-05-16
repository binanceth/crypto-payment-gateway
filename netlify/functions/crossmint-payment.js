exports.handler = async (event) => {
    // Handle preflight CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { amount, currency, customerEmail } = JSON.parse(event.body);

        // Your wallet address
        const walletAddress = '0xee556510Fb70F7F1F1484C22B4D584A871cD204c';

        // Your Crossmint credentials
        const clientId = 'ck_production_5TG2w7cbr8tedKZgwitEuQ7jNxKe';
        const projectId = '13eb3ce8-b831-4927-b560-42ef8d55ca9e';

        // Build the Crossmint checkout URL
        const checkoutUrl = `https://www.crossmint.com/checkout?client-id=${clientId}&projectId=${projectId}&recipient-address=${walletAddress}&email=${customerEmail || ''}&locale=en-US&currency=${currency}&amount=${amount}&blockchain=polygon`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                checkoutUrl: checkoutUrl
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
