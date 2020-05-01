import Peer from "peerjs";
import * as React from "react";
import { shuffle, choose } from "./utils";

import { Player, RemoteManager } from "./remotemanager";
import { narrate } from "./narrator";

import {
  switchMusic,
  oceanAmbience,
  adventurousTheme,
  battleTheme,
  victoryTheme
} from "./music";

import {
  randomCharacter,
  randomLocation,
  randomThing,
  randomQuote,
  randomAction,
  randomDescription,
  randomGIF
} from "./defaults";

import { GIPHY_API_KEY } from "../config";

const giphy = require("giphy-api")({
  https: true,
  apiKey: GIPHY_API_KEY
});

// Return the first GIF available under this search result, if not just return
// a fixed GIF.
async function findDefaultGIF(search: string): Promise<string> {
  try {
    let gifs = (
      await giphy.search({
        https: true,
        q: search,
        limit: 1
      })
    ).data;
    return gifs[0].images.fixed_height.url;
  } catch {
    return randomGIF();
  }
}

const SHORT_TIMEOUT = 45 * 1000;
const LONG_TIMEOUT = 60 * 1000;

const NAME_LIMIT = 50;
const DESCRIPTION_LIMIT = 150;

export class Game extends React.Component<
  { remoteManager: RemoteManager },
  {}
> {
  display: React.RefObject<HTMLDivElement> = React.createRef();
  gifDisplay: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props) {
    super(props);
    this.runGame(props.remoteManager);
  }

  async runGame(remoteManager: RemoteManager) {
    await this.wait(1);
    switchMusic(oceanAmbience);

    let players = remoteManager.getPlayers();

    let shipName: string = "ERROR";
    let captainName: string = "ERROR";
    let treasureName: string = "ERROR";

    let shipGIF: string = "";
    let treasureGIF: string = "";
    let captainGIF: string = "";

    await this.waitingForInput();
    let pre_title_players = shuffle(players);
    await Promise.all(
      pre_title_players.map(async (player, i) => {
        if (i == 0 % players.length) {
          shipName = `The ${await remoteManager.promptPlayer(
            player,
            {
              kind: "text",
              prompt: "The ship you are on is The...",
              limit: NAME_LIMIT
            },
            choose([randomCharacter(), randomThing()]),
            SHORT_TIMEOUT
          )}`;

          shipGIF = await remoteManager.promptPlayer(
            player,
            {
              kind: "giphy",
              prompt: `Select a GIF to represent ${shipName}.`,
              search: shipName
            },
            findDefaultGIF(shipName),
            SHORT_TIMEOUT
          );
        }

        if (i == 1 % players.length) {
          captainName = `Captain ${await remoteManager.promptPlayer(
            player,
            {
              kind: "text",
              prompt: "The ship you are on is lead by Captain...",
              limit: NAME_LIMIT
            },
            randomCharacter(),
            SHORT_TIMEOUT
          )}`;

          captainGIF = await remoteManager.promptPlayer(
            player,
            {
              kind: "giphy",
              prompt: `Select a GIF to represent ${captainName}.`,
              search: captainName
            },
            findDefaultGIF(captainName),
            SHORT_TIMEOUT
          );
        }

        if (i == 2 % players.length) {
          treasureName = `The ${await remoteManager.promptPlayer(
            player,
            {
              kind: "text",
              prompt: "Your party is traveling the oceans looking for The...",
              limit: NAME_LIMIT
            },
            randomThing(),
            SHORT_TIMEOUT
          )}`;

          treasureGIF = await remoteManager.promptPlayer(
            player,
            {
              kind: "giphy",
              prompt: `Select a GIF to represent ${treasureName}.`,
              search: treasureName
            },
            findDefaultGIF(treasureName),
            SHORT_TIMEOUT
          );
        }

        remoteManager.waitingForOthers(player);
      })
    );
    remoteManager.lookUp();
    await this.clear();

    switchMusic(adventurousTheme);
    await this.wait(5);
    await this.writeTitle("DUNCES ON DECK");

    await this.writeLine("Grand adventures await on the high seas!");

    await this.write("Our party sets sail aboard ");
    await this.showGIF(shipGIF);
    await this.write(shipName);

    await this.write(" in hopes of finding ");
    await this.showGIF(treasureGIF);
    await this.writeLine(`${treasureName}!`);

    await this.writeLine(
      "Many treasure seekers have tried but none have ever succeeded!"
    );
    await this.write("Will our adventurers be the first?");
    await this.writeLine(" Only time will tell!");

    switchMusic(oceanAmbience);
    await this.clear();

    await this.write(`Aboard ${shipName} paces the leader of our party, `);
    await this.showGIF(captainGIF);
    await this.writeLine(`${captainName}.`);

    await this.writeLine(`"All hands on deck!" yells ${captainName}. `);
    await this.writeLine(`The crew emerge from their quarters.`);
    await this.writeLine(
      `"Some of you seem to be new here," says ${captainName}, "Why don't you introduce yourselves?"`
    );
    await this.clear();

    await this.waitingForInput();
    type Character = { name: string; introduction: string; gif: string };

    let characters = new Map<Player, Character>();
    await Promise.all(
      players.map(async (player, i) => {
        let name = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: "You are roleplaying as character named...",
            limit: NAME_LIMIT
          },
          randomCharacter(),
          SHORT_TIMEOUT
        );

        let introduction = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: `When asked to introduce themselves, ${name} says...`,
            limit: DESCRIPTION_LIMIT
          },
          randomQuote(),
          LONG_TIMEOUT
        );

        let gif = await remoteManager.promptPlayer(
          player,
          {
            kind: "giphy",
            prompt: `Select a GIF to represent ${name}.`,
            search: name
          },
          findDefaultGIF(name),
          SHORT_TIMEOUT
        );

        characters.set(player, { name, introduction, gif });

        remoteManager.waitingForOthers(player);
      })
    );
    remoteManager.lookUp();
    await this.clear();

    for (let { name, introduction, gif } of characters.values()) {
      await this.showGIF(gif);
      await this.write(`${name} says `);
      await this.writeLine(`"${introduction}"`);
    }

    await this.clear();

    await this.showGIF(captainGIF);
    await this.writeLine(`"Okay listen up crew!" says ${captainName}.`);
    await this.showGIF(treasureGIF);
    await this.writeLine(
      `"Whatever the cost, whatever the struggle, I will find ${treasureName}!"`
    );
    await this.writeLine(
      `"I will go to the ends of the earth to find ${treasureName}!"`
    );
    await this.showGIF(captainGIF);
    await this.writeLine(`"Do you understand?" asks ${captainName}.`);

    await this.writeLine(
      `${captainName} is interrupted as a voice from the mast calls out "Land Ho!"`
    );
    await this.clear();

    type Encounter = { name: string; introduction: string; gif: string };
    type Island = {
      name: string;
      description: string;
      gif: string;
      encounter?: Encounter;
    };

    await this.waitingForInput();
    let playerIslandsShuffle = shuffle(players);
    let islands: Array<Island> = await Promise.all(
      playerIslandsShuffle.map(async (player, i) => {
        let name = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: "Your crew lands on an island named on your map as...",
            limit: NAME_LIMIT
          },
          randomLocation(),
          SHORT_TIMEOUT
        );

        let description = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: `As the crew lands, they see that the island...`,
            limit: DESCRIPTION_LIMIT
          },
          randomDescription(),
          LONG_TIMEOUT
        );

        let gif = await remoteManager.promptPlayer(
          player,
          {
            kind: "giphy",
            prompt: `Select a GIF to represent ${name}.`,
            search: name
          },
          findDefaultGIF(name),
          SHORT_TIMEOUT
        );

        remoteManager.waitingForOthers(player);
        return { name, description, gif };
      })
    );

    await this.waitingForInput();
    await Promise.all(
      playerIslandsShuffle.map(async (player, i) => {
        let island = islands[(i + 1) % islands.length];

        let name = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: `Your crew will land on an island named ${island.name}. When they land, they will see that the island ${island.description}. On this island they will encounter...`,
            limit: NAME_LIMIT
          },
          randomCharacter(),
          SHORT_TIMEOUT
        );

        let introduction = await remoteManager.promptPlayer(
          player,
          {
            kind: "text",
            prompt: `When your crew first comes across ${name}, it...`,
            limit: DESCRIPTION_LIMIT
          },
          randomAction(),
          LONG_TIMEOUT
        );

        let gif = await remoteManager.promptPlayer(
          player,
          {
            kind: "giphy",
            prompt: `Select a GIF to represent ${name}.`,
            search: name
          },
          findDefaultGIF(name),
          SHORT_TIMEOUT
        );

        island.encounter = { name, introduction, gif };
        remoteManager.waitingForOthers(player);
      })
    );

    remoteManager.lookUp();
    await this.clear();

    for (let island of islands) {
      await this.writeLine(`Your crew sees an island in the distance.`);
      await this.write(
        `${captainName} checks his map and finds the island marked as `
      );
      await this.showGIF(island.gif);
      await this.writeLine(`${island.name}.`);

      await this.write(`As you land, you see that the island `);
      await this.writeLine(`${island.description}.`);
      await this.writeLine(`Your party cautiously proceeds...`);

      await this.clear();

      let encounter = island.encounter!;

      switchMusic(battleTheme);
      await this.write(`Suddenly you come across `);
      await this.showGIF(encounter.gif);
      await this.writeLine(`${encounter.name}!`);

      await this.write(`Before you can react, ${encounter.name} `);
      await this.writeLine(`${encounter.introduction}!`);

      await this.clear();

      let playerEncounterShuffle = shuffle(players);

      await this.waitingForInput();
      type Action = { character: Character; action: string; reaction?: string };
      let actions: Array<Action> = await Promise.all(
        playerEncounterShuffle.map(async (player, i) => {
          let character = characters.get(player)!;
          let action = await remoteManager.promptPlayer(
            player,
            {
              kind: "text",
              prompt: `In order to deal with ${encounter.name}, ${character.name}...`,
              limit: DESCRIPTION_LIMIT
            },
            randomAction(),
            LONG_TIMEOUT
          );

          remoteManager.waitingForOthers(player);
          return { character: character, action };
        })
      );

      await this.waitingForInput();
      await Promise.all(
        playerEncounterShuffle.map(async (player, i) => {
          let action = actions[(i + 1) % actions.length];
          action.reaction = await remoteManager.promptPlayer(
            player,
            {
              kind: "text",
              prompt: `In order to deal with ${encounter.name}, ${action.character.name} ${action.action}. In reaction ${encounter.name}...`,
              limit: DESCRIPTION_LIMIT
            },
            randomAction(),
            LONG_TIMEOUT
          );

          remoteManager.waitingForOthers(player);
        })
      );

      remoteManager.lookUp();
      await this.clear();

      for (let action of actions) {
        await this.showGIF(action.character.gif);
        await this.writeLine(`${action.character.name} ${action.action}.`);
        await this.showGIF(encounter.gif);
        await this.writeLine(`${encounter.name} ${action.reaction}.`);
      }

      await this.clear();

      switchMusic(oceanAmbience);

      await this.showGIF(island.gif);
      await this.writeLine(
        `Having dealt with ${encounter.name}, your crew now leaves ${island.name}.`
      );

      await this.clear();
    }

    await this.showGIF(shipGIF);
    await this.writeLine(`Exhausted, your crew is at their breaking point.`);
    await this.writeLine(
      `"It's hopeless!" ${captainName} sobs, "We'll never find ${treasureName}!"`
    );
    await this.writeLine(`"Wait, what's that!" asks ${captainName}.`);

    switchMusic(victoryTheme);
    await this.showGIF(treasureGIF);
    await this.writeLine(`Suddenly in the distance, you see ${treasureName}!`);
    await this.writeLine(`It was all worth it!`);
    await this.writeLine(`You and your crew have done it!`);

    await this.clear();
    await this.writeTitle("THE END");
    await this.writeLine(`Thank you for playing!`, 4, true);
    await this.writeLine(`To play again, refresh the page!`, 4, true);
  }

  wait(seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), Math.floor(seconds * 1000));
    });
  }

  async writeTitle(text: string, delay: number = 5) {
    narrate(text);
    this.gifDisplay.current!.innerHTML = `<h1 class='fadein-slow' style="font-size: 10vmin;">${text}</h1>`;
    await this.wait(delay);
  }

  async waitingForInput() {
    narrate("Please answer the prompt on your phone.");
    this.gifDisplay.current!.innerHTML = `<h1 class='fadein' style="font-size: 5vmin;">Waiting for player input...</h1>`;
  }

  async write(text: string, delay: number = 4, silent = false) {
    if (!silent) narrate(text);
    const element = document
      .createRange()
      .createContextualFragment(`<span class="fadein">${text}</span>`);
    this.display.current!.appendChild(element);
    await this.wait(delay);
  }

  async writeBold(text: string, delay: number = 4) {
    narrate(text);
    await this.write(`<b>${text}<b>`, delay, true);
  }

  async writeLine(text: string, delay: number = 4, silent = false) {
    await this.write(text, delay, silent);
    await this.eol();
  }

  async eol() {
    this.display.current!.appendChild(document.createElement("br"));
  }

  async clear() {
    this.gifDisplay.current!.innerHTML = "";
    this.display.current!.innerHTML = "";
  }

  render() {
    return (
      <>
        <div ref={this.gifDisplay} style={{ height: "20vmin" }}></div>
        <div ref={this.display} style={{ marginTop: "5vmin" }}></div>
      </>
    );
  }

  async showGIF(url: string) {
    this.gifDisplay.current!.innerHTML = `<img class="fadein-slow" style="height: 100%" src='${url}'></img>`;
  }
}
