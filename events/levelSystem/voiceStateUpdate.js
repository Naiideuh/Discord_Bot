import { Events } from "discord.js";
import {
  LevelSystemDatabase,
  VoiceTimeDataBase,
} from "../../utils/database/MySQL.js";

export const name = Events.VoiceStateUpdate;

export const once = false;

export async function execute(oldChannel, newChannel) {
  var levelSystemDatabase = new LevelSystemDatabase();
  var voiceTimeDataBase = new VoiceTimeDataBase();
  const user_id = oldChannel.member.id;
  const guild_id = oldChannel.guild.id;
  const afk_channel_id = oldChannel.guild.afkChannelId;
  voiceTimeDataBase.addVoiceDataRow(
    user_id,
    guild_id,
    oldChannel.channelId,
    newChannel.channelId
  );
  if (newChannel.channelId == null || newChannel.channelId == afk_channel_id) {
    await levelSystemDatabase.verifyUserRowExistence(user_id, guild_id);
    let userDatas = await voiceTimeDataBase.getUserVoiceDataRows(
      user_id,
      guild_id
    );
    let time =
      (userDatas[userDatas.length - 1].timestamp - userDatas[0].timestamp) /
      1000;
    await voiceTimeDataBase.increaseVoiceTime(user_id, guild_id, time);
    await levelSystemDatabase.increaseUserPoints(user_id, guild_id, time / 10);
    await voiceTimeDataBase.deleteVoiceDataRows(user_id, guild_id);
  }
}
