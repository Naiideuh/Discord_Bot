import mysql from "mysql2";
import { Logger } from "../logger.js";

let dbPath = "";
let os = "Unknown OS";
os = process.platform;
if (os != "win32") dbPath = "/var/run/mysqld/mysqld.sock";

export class discordbot_Database {
  constructor() {
    this.db = mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      port: dbPath,
      database: "discordbot_db",
      supportBigNumbers: true,
    });
  }
}

export class VoiceTimeDataBase extends discordbot_Database {
  async addVoiceDataRow(userId, guildId, oldChannel, newChannel) {
    this.db
      .promise()
      .query(
        `insert into user_vocal (user_id, guild_id ,old_channel, new_channel, timestamp) values (${userId}, ${guildId}, ${oldChannel}, ${newChannel}, ${new Date().getTime()})`
      );
  }

  async getUserVoiceDataRows(userId, guildId) {
    return (
      await this.db
        .promise()
        .query(
          `select * from user_vocal where user_id = ${userId} and guild_id = ${guildId} order by timestamp`
        )
    )[0];
  }

  async increaseVoiceTime(userId, guildId, time) {
    this.db
      .promise()
      .query(
        `update user_level set vocal_time = vocal_time + ${time} where user_id = ${userId} and guild_id = ${guildId}`
      );
  }

  async deleteVoiceDataRows(userId, guildId) {
    this.db
      .promise()
      .query(
        `delete from user_vocal where user_id = ${userId} and guild_id = ${guildId}`
      );
  }
}

export class GuildSettingsDatabase extends discordbot_Database {
  async createGuildSettingsRow(guildId) {
    this.db
      .promise()
      .query(`insert into guild_settings (guild_id) value (${guildId})`);
  }

  async getGuildSettings(guildId) {
    return (
      await this.db
        .promise()
        .query(`select * from guild_settings where guild_id = ${guildId}`)
    )[0][0];
  }

  async updateGuildSettingsLevelChannel(levelChannel, guildId) {
    this.db
      .promise()
      .query(
        `update guild_settings set level_channel = ${levelChannel} where guild_id = ${guildId}`
      );
  }

  async updateGuildSettingsVoiceChannelGenerator(
    voiceChannelGenerator,
    guildId
  ) {
    this.db
      .promise()
      .query(
        `update guild_settings set voiceChannel_generator = ${voiceChannelGenerator} where guild_id = ${guildId}`
      );
  }

  async updateGuildSettingsGuildActivityChannel(guildActivityChannel, guildId) {
    this.db
      .promise()
      .query(
        `update guild_settings set activity_channel = ${guildActivityChannel} where guild_id = ${guildId}`
      );
  }

  async updateGuildSettingsFormula(formula, guildId) {
    this.db
      .promise()
      .query(
        `update guild_settings set formula = '${formula}' where guild_id = ${guildId}`
      );
  }
}

export class LevelSystemDatabase extends discordbot_Database {
  async isUserCreated(userId, guildId) {
    let userDatas = await this.getUserById(userId, guildId);
    if (!userDatas) {
      return false;
    } else {
      return true;
    }
  }

  async verifyUserRowExistence(userId, guildId) {
    if (!(await this.isUserCreated(userId, guildId))) {
      await this.createUserLevelDataRow(userId, guildId);
    }
  }

  async getUserById(userId, guildId) {
    return (
      await this.db
        .promise()
        .query(
          `select * from user_level where user_id = "${userId}" and guild_id = "${guildId}";`
        )
    )[0][0];
  }

  async getUsers(guildId) {
    return await this.db
      .promise()
      .query(`select * from user_level where guild_id = "${guildId}";`);
  }

  async createUserLevelDataRow(userId, guildId) {
    Logger.info(
      `Création de la ligne du user : ${userId} de la guilde : ${guildId}`
    );
    this.db
      .promise()
      .query(
        `insert into user_level (user_id, guild_id, level, points)  values (${userId}, ${guildId}, 1, 0)`
      );
  }

  async increaseUserPoints(userId, guildId, points) {
    Logger.info(
      `Augmentation des points du user : ${userId} de la guilde : ${guildId} de ${points} points`
    );
    this.db
      .promise()
      .query(
        `update user_level set points = points + ${points} where user_id = ${userId} and guild_id = ${guildId}`
      );
  }

  async increaseUserLevel(userId, guildId) {
    Logger.info(
      `Augmentation du niveau du user : ${userId} de la guilde : ${guildId}`
    );
    this.db
      .promise()
      .query(
        `update user_level set level = level + 1 where user_id = ${userId} and guild_id = ${guildId}`
      );
  }

  async setUserLevel(userId, guildId, level) {
    this.db
      .promise()
      .query(
        `update user_level set level = ${level} where user_id = ${userId} and guild_id = ${guildId}`
      );
  }
}

export class GuildMessagesByChannelDatabase extends discordbot_Database {
  async getChannelById(guildId, channelId) {
    return await this.db
      .promise()
      .query(
        `select * from guild_messages_by_channel where guild_id = ${guildId} and channel_id = ${channelId}`
      );
  }

  async getChannelsByGuildIdOrderByNumber(guildId) {
    return (
      await this.db
        .promise()
        .query(
          `select * from guild_messages_by_channel where guild_id = ${guildId} order by nbr_messages desc`
        )
    )[0];
  }

  async isChannelCreated(guildId, channelId) {
    let channelDatas = (await this.getChannelById(guildId, channelId))[0][0];
    if (!channelDatas) {
      return false;
    } else {
      return true;
    }
  }

  async createChannelDataRow(guildId, channelId) {
    await this.db
      .promise()
      .query(
        `insert into guild_messages_by_channel (guild_id, channel_id) value (${guildId}, ${channelId})`
      );
  }

  async verifyChannelRowExistence(guildId, channelId) {
    if (!(await this.isChannelCreated(guildId, channelId))) {
      await this.createChannelDataRow(guildId, channelId);
    }
  }

  async addMessageToChannelDatabase(guildId, channelId) {
    await this.db
      .promise()
      .query(
        `update guild_messages_by_channel set nbr_messages = nbr_messages + 1 where channel_id = ${channelId} and guild_id = ${guildId}`
      );
  }

  async deleteGuildChannels(guildId) {
    await this.db
      .promise()
      .query(
        `delete from guild_messages_by_channel where guild_id = ${guildId}`
      );
  }
}
