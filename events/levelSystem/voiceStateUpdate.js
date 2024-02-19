import { Events } from "discord.js";
import { discordbot_Database } from "../../utils/database/MySQL.js";

export const name = Events.VoiceStateUpdate;

export const once = false;

export async function execute(oldChannel, newChannel) {
  var SQLDatabase = new discordbot_Database();
  const user_id = oldChannel.member.id;
  const guild_id = oldChannel.guild.id;
  const afk_channel_id = oldChannel.guild.afkChannelId;
  SQLDatabase.addVoiceDataRow(
    user_id,
    guild_id,
    oldChannel.channelId,
    newChannel.channelId
  );
  if (newChannel.channelId == null || newChannel.channelId == afk_channel_id) {
    await SQLDatabase.verifyUserRowExistence(user_id, guild_id);
    let userDatas = (
      await SQLDatabase.getUserVoiceDataRows(user_id, guild_id)
    )[0];
    let time =
      (userDatas[userDatas.length - 1].timestamp - userDatas[0].timestamp) /
      1000;
    await SQLDatabase.increaseVoiceTime(user_id, guild_id, time);
    await SQLDatabase.increaseUserPoints(user_id, guild_id, time / 10);
    await SQLDatabase.deleteVoiceDataRows(user_id, guild_id);
  }
}
