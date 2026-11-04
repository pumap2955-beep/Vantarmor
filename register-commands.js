import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandJson } from './commands.js';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error('Faltan DISCORD_TOKEN o DISCORD_CLIENT_ID en el archivo .env');
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const route = Routes.applicationCommands(DISCORD_CLIENT_ID);

console.log(`Registrando ${commandJson.length} comandos globalmente para todos los servidores...`);
await rest.put(route, { body: commandJson });
console.log('Comandos registrados correctamente.');
