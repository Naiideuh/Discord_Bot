import { Events, ChannelType } from "discord.js";
import { discordbot_Database } from "../../utils/database/MySQL.js";

export const name = Events.VoiceStateUpdate;

export const once = false;

export async function execute(oldChannel, newChannel) {
  var SQLDatabase = new discordbot_Database();
  let guildSettings = (
    await SQLDatabase.getGuildSettingsVoiceChannelGenerator(oldChannel.guild.id)
  )[0][0];
  if (!guildSettings) return;
  if (
    newChannel.channelId != guildSettings.voiceChannel_generator ||
    guildSettings.voiceChannel_generator == null
  )
    return;
  if (newChannel.channelId == guildSettings.voiceChannel_generator) {
    const channel = await newChannel.guild.channels.create({
      name: "Général",
      type: ChannelType.GuildVoice,
    });
    newChannel.setChannel(channel);
  }
}
