exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { amount, currency, customerEmail } = JSON.parse(event.body);
        const walletAddress = '0xee556510Fb70F7F1F1484C22B4D584A871cD204c';
        const apiKey = 'ck_production_5TG2w7cbr8tedKZgwitEuQ7jNxKe';

        const response = await fetch('https://www.crossmint.com/api/2022-06-09/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({
                lineItems: [{
                    collectionLocator: 'crossmint:13eb3ce8-b831-4927-b560-42ef8d55ca9e',
                    callData: {
                        totalPrice: amount.toString(),
                        quantity: 1,
                        recipient: walletAddress
                    }
                }],
                payment: {
                    method: 'polygon',
                    currency: currency.toLowerCase()
                },
                customer: customerEmail ? { email: customerEmail } : undefined,
                locale: 'en-US'
            })
        });

        const data = await response.json();
        const checkoutUrl = data.onRamp?.url || `https://www.crossmint.com/checkout/${data.id}`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, checkoutUrl })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
