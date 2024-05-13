import { Events } from "discord.js";
import { discordbot_Database } from "../../utils/database/MySQL.js";

export const name = Events.ClientReady;

export const once = false;

export async function execute(readyClient) {
  console.log(`Logged in as ${readyClient.user.tag}!`);
}
