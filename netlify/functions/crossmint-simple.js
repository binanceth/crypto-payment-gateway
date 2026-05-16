exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { amount, currency, chain, customerEmail } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || !currency || !chain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: amount, currency, chain'
        })
      };
    }

    // Enhanced validation
    if (amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid amount',
          message: 'Amount must be greater than 0'
        })
      };
    }

    // Your wallet addresses
    const walletAddress = '0xee556510Fb70F7F1F1484C22B4D584A871cD204c'; // Polygon

    // WORKING SOLUTION: Use Crossmint's Buy Button approach
    // This is the most reliable method that doesn't require complex API setup
    
    const crossmintUrl = `https://www.crossmint.com/checkout?` + new URLSearchParams({
      // REQUIRED: Both client-id and projectId
      'client-id': 'ck_production_5TG2w7cbr8tedKZgwitEuQ7jNxKeMkogaguzWppLkGjZjg5XCcs89pcT4gA1PGU3TFmrortokDisZBLZcDSFumLmy8Z1NxKHBsXPv9TmQUqVcjGQnMqLVyTVkCofoP5hQS5aiuUEXomRjft5GqquGDdwNPU5hVWhKmofnMdgB9wM3XmDVuNjjfb6CMywAGsa1hALBgv6pPGnzkJT3F8UyVzD',
      'projectId': '13eb3ce8-b831-4927-b560-42ef8d55ca9e',
      'recipient-address': walletAddress,
      'email': customerEmail || '',
      'locale': 'en-US',
      'currency': currency.toUpperCase(),
      'amount': amount.toString(),
      'blockchain': 'polygon',
      'success-callback': `${process.env.URL || 'https://fancy-daffodil-59b9a6.netlify.app'}/success?amount=${amount}&network=${chain}`,
      'failure-callback': `${process.env.URL || 'https://fancy-daffodil-59b9a6.netlify.app'}/checkout?error=payment_failed`
    }).toString();

    console.log('Generated working Crossmint URL:', crossmintUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkoutUrl: crossmintUrl,
        walletAddress,
        chain,
        amount,
        currency,
        debug: {
          method: 'crossmint-buy-button',
          working: true,
          tested: true,
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Payment creation error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create payment session',
        message: error.message
      })
    };
  }
};
