import GameManager from "../../r2modmanPlus/src/model/game/GameManager";
import { v4 as uuid } from "uuid";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { GameDefinition } from "../models";
import { convertDisplayMode, convertGameType, convertPlatform } from "../utils";
import { loadGameDefinitions } from "../load";

const existingDefinitions = loadGameDefinitions();
const settingsIdentifierToUuid = new Map<string, string>();
for (const def of existingDefinitions) {
  settingsIdentifierToUuid.set(def.legacy.settingsIdentifier, def.uuid);
}

const games: GameDefinition[] = GameManager.gameList.map((x) => ({
  uuid: settingsIdentifierToUuid.get(x.settingsIdentifier) ?? uuid(),
  label: x.thunderstoreCommunity,
  meta: {
    displayName: x.displayName,
    iconUrl: x.gameImage,
  },
  distributions: x.storePlatformMetadata.map((p) => ({
    platform: convertPlatform(p.storePlatform),
    identifier: p.storeIdentifier,
  })),
  legacy: {
    internalFolderName: x.internalFolderName,
    dataFolderName: x.dataFolderName,
    settingsIdentifier: x.settingsIdentifier,
    packageIndex: x.thunderstoreUrl,
    exclusionsUrl: x.exclusionsUrl,
    steamFolderName: x.steamFolderName,
    exeNames: x.exeName,
    gameInstancetype: convertGameType(x.instanceType),
    gameSelectionDisplayMode: convertDisplayMode(x.displayMode),
  },
}));

for (const game of games) {
  fs.writeFileSync(
    `./data/generated/${game.label}.yml`,
    yaml.dump(game, {
      quotingType: '"',
      forceQuotes: true,
    })
  );
}
