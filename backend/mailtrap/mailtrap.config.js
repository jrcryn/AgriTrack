import { MailtrapClient } from "mailtrap";

import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// hindi ko alam bakit, pero needed na talaga to kasi hindi mabasa yung secrets sa env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TOKEN = process.env.MAILTRAP_API_TOKEN;

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "AgriTrack - Alpha",
};