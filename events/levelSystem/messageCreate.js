import { Events } from "discord.js";
import { discordbot_Database } from "../../utils/database/MySQL.js";

export const name = Events.MessageCreate;

export const once = false;

export async function execute(message) {
  var SQLDatabase = new discordbot_Database();
  const user_id = message.author.id;
  const guild_id = message.member.guild.id;
  if (message.author.bot == true) return;
  const A = 10;
  const EXP = 10;

  let userDatas = (await SQLDatabase.getUserById(user_id, guild_id))[0][0];

  await SQLDatabase.verifyUserRowExistence(user_id, guild_id);
  console.log("[LEVEL_SYSTEM] Augmentation des points du user : ", user_id);
  await SQLDatabase.increaseUserPoints(user_id, guild_id);
  if (userDatas.points + 1 >= A * EXP ** userDatas.level) {
    console.log("[LEVEL_SYSTEM] Augmentation du niveau du user : ", user_id);
    await SQLDatabase.increaseUserLevel(user_id, guild_id);
    const Embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Bravo pour le passage de niveau !`)
      .setDescription(
        `Félicitations à <@${message.member.id}> pour être passé au niveau ${
          userDatas.level + 1
        }
            \nTu comptabilises un total de ${userDatas.points + 1} points`
      )
      .setThumbnail(message.member.displayAvatarURL())
      .setTimestamp(new Date().getTime());
    let guildSettings = (await SQLDatabase.getGuildSettings(guild_id))[0][0];
    if (guildSettings.level_channel) {
      client.channels.cache
        .find((channel) => channel.id == guildSettings.level_channel)
        .send({ embeds: [Embed] });
    } else {
      client.channels.cache
        .find((channel) => channel.id == message.channel.id)
        .send({ embeds: [Embed] });
    }
  }
}
