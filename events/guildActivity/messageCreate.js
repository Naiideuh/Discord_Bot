import { Events } from "discord.js";
import { GuildMessagesByChannelDatabase } from "../../utils/database/MySQL.js";

export const name = Events.MessageCreate;

export const once = false;

export async function execute(message) {
  let guildMessagesByChannelDatabase = new GuildMessagesByChannelDatabase();
  await guildMessagesByChannelDatabase.verifyChannelRowExistence(
    message.member.guild.id,
    message.channel.id
  );
  await guildMessagesByChannelDatabase.addMessageToChannelDatabase(
    message.member.guild.id,
    message.channel.id
  );
}
