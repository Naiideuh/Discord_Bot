import { CommunityBuilds } from "communitybuilds-node";
import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  EmbedBuilder,
} from "discord.js";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchGenshinPersoChoices(element) {
  CommunityBuilds.init("AIzaSyD90gEegeOw9SjPkT9UiOerHEh5WS1Z_tA");
  let personnagesChoix = [];
  await CommunityBuilds.getCharactersByElement(element)
    .then((arrayPersonnages) => {
      for (let GenshinCharacter of arrayPersonnages) {
        personnagesChoix.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(capitalizeFirstLetter(GenshinCharacter.name))
            .setValue(GenshinCharacter.name)
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return personnagesChoix;
}

async function fetchGenshinWeaponsType(weaponsType) {
  let weaponsChoix = [];
  await CommunityBuilds.getWeaponsByType(weaponsType)
    .then((arrayType) => {
      for (let weapon of arrayType) {
        weaponsChoix.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(capitalizeFirstLetter(weapon.name))
            .setValue(weapon.name)
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return weaponsChoix;
}

const elementsChoices = [
  {
    name: "pyro",
    value: "pyro",
  },
  {
    name: "hydro",
    value: "hydro",
  },
  {
    name: "anemo",
    value: "anemo",
  },
  {
    name: "dendro",
    value: "dendro",
  },
  {
    name: "geo",
    value: "geo",
  },
  {
    name: "electro",
    value: "electro",
  },
  {
    name: "cryo",
    value: "cryo",
  },
];

const weaponsChoice = [
  {
    name: "claymores",
    value: "claymores",
  },
  {
    name: "swords",
    value: "swordss",
  },
  {
    name: "catalysts",
    value: "catalysts",
  },
  {
    name: "polearms",
    value: "polearms",
  },
  {
    name: "bows",
    value: "bows",
  },
];

export const data = new SlashCommandBuilder()
  .setName("genshin")
  .setDescription("Donne des informations sur Genshin Impact")
  .addSubcommand((user) =>
    user
      .setName("personnage")
      .setDescription("Donne des informations sur un personnage en particulier")
      .addStringOption((options) =>
        options
          .setName("element")
          .setDescription("Element du personnage")
          .addChoices(...elementsChoices)
          .setRequired(true)
      )
  )
  .addSubcommand((weapon) =>
    weapon
      .setName("armes")
      .setDescription("Donne des informations sur une arme en particulier")
      .addStringOption((options) =>
        options
          .setName("type")
          .setDescription("Type d'arme")
          .addChoices(...weaponsChoice)
          .setRequired(true)
      )
  );

export const category = "utils";

export async function execute(interaction) {
  try {
    switch (interaction.options._subcommand) {
      case "personnage":
        executeCharacter(interaction);
        break;
      case "armes":
        interaction.reply({
          content: "Cette option n'est pas opérationnelle pour le moment",
        });
        //executeWeapons(interaction);
        break;
      case "artefacts":
        break;
    }
  } catch (e) {
    await interaction.editReply({
      content: "Pas de personnage choisi, annulation de la commande",
      components: [],
    });

    console.log(e);
  }
}

async function executeCharacter(interaction) {
  const personnagesChoices = await fetchGenshinPersoChoices(
    interaction.options._hoistedOptions[0].value
  );

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("personnage")
      .setPlaceholder("Personnage Genshin")
      .addOptions(...personnagesChoices)
  );

  interaction.reply({
    content: "Choisis un personnage Genshin",
    components: [row],
    ephemeral: true,
  });

  const collector = interaction.channel.createMessageComponentCollector({
    filter: (interactionFilter) =>
      interactionFilter.user.id == interaction.user.id,
    time: 60000,
  });

  let resultat = await CommunityBuilds.getCharactersByElement(
    interaction.options._hoistedOptions[0].value
  );

  collector.once("collect", async (GenshinCharacter) => {
    const Messagecontent = `Résultats de builds trouvés pour : ${resultat
      .filter((character) => character.name == GenshinCharacter.values[0])[0]
      .name.toString()}`;

    const buttons = new ActionRowBuilder();

    for (let build of resultat.filter(
      (character) => character.name == GenshinCharacter.values[0]
    )[0].builds) {
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(build.role)
          .setStyle("Secondary")
          .setLabel(build.role)
      );
    }

    resultat = resultat.filter(
      (character) => character.name == GenshinCharacter.values[0]
    )[0];

    const GenshinCharacterName = GenshinCharacter.values[0];

    await GenshinCharacter.update({
      content: Messagecontent,
      components: [buttons],
    });

    collector.once("collect", async (Build) => {
      resultat = resultat.builds.find((build) => build.role == Build.customId);

      let Description = "";
      for (let opt in resultat) {
        let DescriptionComponent = "";
        if (typeof resultat[opt] == "object") {
          for (let object in resultat[opt]) {
            DescriptionComponent = `${DescriptionComponent} ${resultat[opt][object]}, \n`;
          }
        } else {
          DescriptionComponent = `${resultat[opt]} \n`;
        }
        Description =
          Description +
          `**${capitalizeFirstLetter(opt)}** : ${DescriptionComponent} \n`;
      }

      const Embed = new EmbedBuilder()
        .setTitle(`**__${capitalizeFirstLetter(GenshinCharacterName)}__**`)
        .setDescription(Description);

      Build.update({
        content: "",
        components: [],
        embeds: [Embed],
      });
    });
  });
}

async function executeWeapons(interaction) {
  interaction.deferReply({
    ephemeral: true,
  });

  const weaponsChoices = await fetchGenshinWeaponsType(
    interaction.options._hoistedOptions[0].value
  );

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("personnage")
      .setPlaceholder("Personnage Genshin")
      .addOptions(...weaponsChoices)
  );

  interaction.editReply({
    content: "Choisis une arme Genshin",
    components: [row],
    ephemeral: true,
  });

  const collector = interaction.channel.createMessageComponentCollector({
    filter: (interactionFilter) =>
      interactionFilter.user.id == interaction.user.id,
    time: 60000,
  });

  collector.on("collect", async (weapon) => {
    weapon.deferReply({
      ephemeral: true,
    });
    let resultat = await CommunityBuilds.getWeaponsByType(
      interaction.options._hoistedOptions[0].value
    );
    resultat = resultat.find((arme) => arme.name == weapon.values[0]);

    console.log(resultat);

    let Description = "";
    for (let opt of ["name", "mainStat", "subStat", "passiveEffect"]) {
      let DescriptionComponent = "";
      if (typeof resultat[opt] == "object") {
        for (let object in resultat[opt]) {
          DescriptionComponent = `${DescriptionComponent} ${object}  : ${resultat[opt][object]}, \n`;
        }
      } else {
        DescriptionComponent = `${resultat[opt]} \n`;
      }
      Description =
        Description +
        `**${capitalizeFirstLetter(opt)}** : ${DescriptionComponent} \n`;
    }

    const Embed = new EmbedBuilder()
      .setTitle(`**__${capitalizeFirstLetter(weapon.values[0])}__**`)
      .setDescription(Description)
      .setImage(resultat.img);
    weapon.editReply({
      embeds: [Embed],
    });
  });
}
