import { MailtrapClient } from "mailtrap";

import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// hindi ko alam bakit, pero needed na talaga to kasi hindi mabasa yung secrets sa env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TOKEN = process.env.MAILTRAP_API_TOKEN;

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "jjjrcapstone@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "INTEGRATION TEST: 1234567890",
    text: "Nakakapanghina yung grade natin sa Capstone.",
    category: "Integration Test",
  })
  .then(console.log, console.error);