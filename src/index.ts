import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Config endpoint
app.get('/api/crossmint/config', (_req: Request, res: Response) => {
  res.json({ success: true, config: { environment: 'production' } });
});

// PAYMENT ENDPOINT - CORRECT VERSION
app.post('/api/crossmint/payment', async (req: Request, res: Response) => {
  console.log('=== PAYMENT REQUEST RECEIVED ===');
  console.log('Body:', req.body);
  
  try {
    const { amount, currency, customerEmail } = req.body;
    
    const walletAddress = '0xee556510Fb70F7F1F1484C22B4D584A871cD204c';
    const apiKey = process.env.CROSSMINT_API_KEY || '';
    const projectId = '13eb3ce8-b831-4927-b560-42ef8d55ca9e';

    console.log('Calling Crossmint API...');
    
    // CORRECT API ENDPOINT
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
          currency: 'usdc'  // Fixed to USDC
        },
        customer: customerEmail ? { email: customerEmail } : undefined,
        locale: 'en-US'
      })
    });

    const data: any = await response.json();
    console.log('Crossmint response:', data);
    
    const checkoutUrl = data.onRamp?.url || data.url;
    
    if (checkoutUrl) {
      res.json({ success: true, checkoutUrl });
    } else {
      res.status(500).json({ success: false, error: data.message || 'Failed to create checkout' });
    }
    
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

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
