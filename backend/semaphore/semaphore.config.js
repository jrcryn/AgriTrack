import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const api_key = process.env.SEMAPHORE_API_KEY;

export const sendSMS = async (phone, message) => {
  try { //IMPORTANT! - (FOR TESTING) normal sending in development, (DEPLOYMENT) change to priority in production
    const response = await axios.post('https://api.semaphore.co/api/v4/messages', { 
      apikey: api_key,
      number: phone,
      message: message,
      sendername: 'CanBRS'
    });
    console.log('SMS sent: ', response.data);
  } catch (error) {
    console.error('Error sending SMS: ', error.response?.data || error.message);
    throw new Error('Failed to send SMS');
  }
}