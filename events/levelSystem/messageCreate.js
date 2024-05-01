import { Events } from "discord.js";
import {
  LevelSystemDatabase,
  GuildSettingsDatabase,
} from "../../utils/database/MySQL.js";
import { EmbedBuilder } from "discord.js";
import { Logger } from "../../utils/logger.js";

export const name = Events.MessageCreate;

export const once = false;

export async function execute(message) {
  var levelSystemDatabase = new LevelSystemDatabase();
  const user_id = message.author.id;
  const guild_id = message.member.guild.id;
  if (message.author.bot == true) return;
  var guildSettingsDatabase = new GuildSettingsDatabase();
  let guildSettings = await guildSettingsDatabase.getGuildSettings(guild_id);
  let formula = JSON.parse(guildSettings.formula);
  const base = formula.base;
  const exponent = formula.exponent;
  await levelSystemDatabase.verifyUserRowExistence(user_id, guild_id);
  await levelSystemDatabase.increaseUserPoints(user_id, guild_id, 1);
  let userDatas = await levelSystemDatabase.getUserById(user_id, guild_id);
  if (userDatas.points >= base * exponent ** userDatas.level) {
    await levelSystemDatabase.increaseUserLevel(user_id, guild_id);
    const Embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Bravo pour le passage de niveau !`)
      .setDescription(
        `Félicitations à <@${user_id}> pour être passé au niveau ${
          userDatas.level + 1
        }
                \nTu comptabilises un total de ${userDatas.points + 1} points
                \nProchain niveau à ${
                  base * exponent ** (userDatas.level + 1)
                } points`
      )
      .setThumbnail(message.member.displayAvatarURL())
      .setTimestamp(new Date().getTime());
    let guildSettingsDatabase = new GuildSettingsDatabase();
    let guildSettings = await guildSettingsDatabase.getGuildSettings(guild_id);
    if (guildSettings.level_channel) {
      message.client.channels.cache
        .find((channel) => channel.id == guildSettings.level_channel)
        .send({ embeds: [Embed] });
    } else {
      message.client.channels.cache
        .find((channel) => channel.id == message.channel.id)
        .send({ embeds: [Embed] });
    }
  }
}
