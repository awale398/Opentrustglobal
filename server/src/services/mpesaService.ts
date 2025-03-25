import axios from 'axios';
import crypto from 'crypto';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

// Generate access token
export const generateAccessToken = async (): Promise<string> => {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

// Generate timestamp
const generateTimestamp = (): string => {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
};

// Generate password
const generatePassword = (timestamp: string): string => {
  const str = SHORTCODE + PASSKEY + timestamp;
  return crypto.createHash('base64').update(str).digest('base64');
};

// Initiate STK Push
export const initiateSTKPush = async (
  accessToken: string,
  amount: number,
  phoneNumber: string
): Promise<any> => {
  try {
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: 'OpenTrust',
        TransactionDesc: 'Payment for OpenTrust Services'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw new Error('Failed to initiate STK Push');
  }
};

// Check transaction status
export const checkTransactionStatus = async (merchantRequestId: string): Promise<string> => {
  try {
    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: merchantRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resultCode = response.data.ResultCode;
    return resultCode === 0 ? 'completed' : 'failed';
  } catch (error) {
    console.error('Error checking transaction status:', error);
    throw new Error('Failed to check transaction status');
  }
}; 