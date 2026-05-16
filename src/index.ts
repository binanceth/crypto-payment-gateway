import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Config endpoint
app.get('/api/crossmint/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      clientId: process.env.CROSSMINT_CLIENT_ID || 'ck_production_...',
      environment: 'production'
    }
  });
});

// PAYMENT ENDPOINT
app.post('/api/crossmint/payment', async (req: Request, res: Response) => {
  console.log('=== PAYMENT REQUEST RECEIVED ===');
  console.log('Body:', req.body);
  
  try {
    const { amount, currency, customerEmail } = req.body;
    
    // Your credentials
    const walletAddress = '0xee556510Fb70F7F1F1484C22B4D584A871cD204c';
    const apiKey = 'ck_production_5TG2w7cbr8tedKZgwitEuQ7jNxKeMkogaguzWppLkGjZjg5XCcs89pcT4gA1PGU3TFmrortokDisZBLZcDSFumLmy8Z1NxKHBsXPv9TmQUqVcjGQnMqLVyTVkCofoP5hQS5aiuUEXomRjft5GqquGDdwNPU5hVWhKmofnMdgB9wM3XmDVuNjjfb6CMywAGsa1hALBgv6pPGnzkJT3F8UyVzD';
    const projectId = '13eb3ce8-b831-4927-b560-42ef8d55ca9e';

    console.log('Calling Crossmint API...');
    
    const response = await fetch('https://www.crossmint.com/api/2022-06-09/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        lineItems: [{
          collectionLocator: `crossmint:${projectId}`,
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

    const data: any = await response.json();
    console.log('Crossmint response:', data);
    
    const checkoutUrl = data.onRamp?.url || data.url || `https://www.crossmint.com/checkout/${data.id}`;
    
    res.json({ success: true, checkoutUrl });
    
  } catch (error: any) {
    console.error('Payment error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve checkout page
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/checkout.html'));
});

app.get('/checkout', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/checkout.html'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Payment endpoint: http://localhost:${PORT}/api/crossmint/payment`);
});
