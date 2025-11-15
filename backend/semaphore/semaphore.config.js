import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const username = process.env.CLICKSEND_USERNAME;
const api_key = process.env.CLICKSEND_API_KEY;
const authToken = Buffer.from(`${username}:${api_key}`).toString('base64');

export const sendSMS = async (phone, message) => {
  try {
    // Format phone number for ClickSend (E.164 format)
    const formattedPhone = phone.startsWith('+') ? phone : `+63${phone.replace(/^0/, '')}`;
    
    const response = await axios.post(
      'https://rest.clicksend.com/v3/sms/send',
      {
        messages: [
          {
            to: formattedPhone,
            body: message,
            from: 'AgriTrack'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        }
      }
    );
    
    console.log('SMS sent: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS: ', error.response?.data || error.message);
    throw new Error('Failed to send SMS');
  }
}