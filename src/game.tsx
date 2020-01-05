import Peer from "peerjs";
import * as React from "react";
import { shuffle } from "./utils";

import { Player, RemoteManager } from "./remotemanager";

export class Game extends React.Component<
  { remoteManager: RemoteManager },
  {}
> {
  display: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.display = React.createRef();

    this.runGame(props.remoteManager);
  }

  async runGame(remoteManager: RemoteManager) {
    let players = remoteManager.getPlayers();

    let shipName: string = "ERROR";
    let captainName: string = "ERROR";
    let treasureName: string = "ERROR";

    let pre_title_players = shuffle(players);
    await Promise.all(
      pre_title_players.map(async (player, i) => {
        if (i == 0 % players.length) {
          shipName = `<b>The ${await remoteManager.promptPlayer(
            player,
            "The ship you are on is The..."
          )}</b>`;
        }

        if (i == 1 % players.length) {
          captainName = `<b>Captain ${await remoteManager.promptPlayer(
            player,
            "The ship you are on is lead by Captain..."
          )}</b>`;
        }

        if (i == 2 % players.length) {
          treasureName = `<b>The ${await remoteManager.promptPlayer(
            player,
            "Your party is traveling the oceans looking for The..."
          )}</b>`;
        }

        remoteManager.waitingForOthers(player);
      })
    );
    remoteManager.lookUp();

    await this.writeTitle("DUNCES ON DECK");
    await this.wait(5);
    await this.clear();

    await this.write("Grand adventures await on the high seas!<br>");

    await this.write("Our party sets sail aboard ");
    await this.write(shipName);

    await this.write(" in hopes of finding ");
    await this.write(`${treasureName}!<br>`);

    await this.write(
      "Many treasure seekers have tried but none have ever succeeded!<br>"
    );
    await this.write("Will our adventurers be the first?");
    await this.write(" Only time will tell!");

    await this.clear();

    await this.write(`Aboard the ${shipName} paces the leader of our party, `);
    await this.write(`${captainName}.<br>`);
    //
    // await this.write(`${captainName}: All hands on deck!<br>`);
    // await this.write(`The crew emerge from their quarters.<br>`);
    // await this.write(
    //   `${captainName}: Some of you seem to be new here so why don't you introduce yourselves.`
    // );
    // await this.clear();
    //
    // type Character = { name: string; introduction: string };
    //
    // let characters = new Map<Player, Character>();
    // await Promise.all(
    //   players.map(async (player, i) => {
    //     let name = `<b>${await remoteManager.promptPlayer(
    //       player,
    //       "You are roleplaying as character named..."
    //     )}</b>`;
    //
    //     let introduction = `<b>${await remoteManager.promptPlayer(
    //       player,
    //       `When asked to introduce themselves, ${name} says...`
    //     )}</b>`;
    //
    //     characters.set(player, { name, introduction });
    //   })
    // );
    //
    // for (let { name, introduction } of characters.values()) {
    //   await this.write(`${name}: `);
    //   await this.write(`${introduction}<br>`);
    // }
    //
    // await this.clear();
    //
    // await this.write(`${captainName}: Okay listen up crew!<br>`);
    // await this.write(
    //   `${captainName}: Whatever the cost, whatever the struggle, I will find ${treasureName}!<br>`
    // );
    // await this.write(
    //   `${captainName}: I will go to the ends of the earth to find ${treasureName}!<br>`
    // );
    // await this.write(`${captainName}: Do you understand?<br>`);
    //
    // await this.write(
    //   `${captainName} is interrupted as a voice from the mast calls out "Land Ho!"<br>`
    // );
    // await this.clear();
    //
    // let playerIslandsShuffle = shuffle(players);
    // let islands: Array<any> = await Promise.all(
    //   playerIslandsShuffle.map(async (player, i) => {
    //     let name = `<b>${await promptPlayer(
    //       player,
    //       "Your crew lands on an island named on your map as..."
    //     )}</b>`;
    //
    //     let description = `<b>${await promptPlayer(
    //       player,
    //       `As the crew lands, they see that the island...`
    //     )}</b>`;
    //
    //     return { name, description };
    //   })
    // );
    //
    // await Promise.all(
    //   playerIslandsShuffle.map(async (player, i) => {
    //     let island = islands[(i + 1) % islands.length];
    //
    //     let name = `<b>${await promptPlayer(
    //       player,
    //       `Your crew will land on an island named ${island.name}. When they land, they will see that the island ${island.description}. On this island they will encounter...`
    //     )}</b>`;
    //
    //     let introduction = `<b>${await promptPlayer(
    //       player,
    //       `When your crew first comes across ${name}, it...`
    //     )}</b>`;
    //
    //     island.encounter = { name, introduction };
    //   })
    // );
    //
    // for (let island of islands) {
    //   await this.write(`Your crew sees an island in the distance.<br>`);
    //   await this.write(
    //     `${captainName} checks his map and finds the island marked as `
    //   );
    //   await this.write(`${island.name}.<br>`);
    //
    //   await this.write(`As you land, you see that the island `);
    //   await this.write(`${island.description}.<br>`);
    //   await this.write(`Your party cautiously proceeds...<br>`);
    //
    //   await this.clear();
    //
    //   let encounter = island.encounter;
    //
    //   await this.write(`Suddenly you come across `);
    //   await this.write(`${encounter.name}!<br>`);
    //
    //   await this.write(`Before you can react, ${encounter.name} `);
    //   await this.write(`${encounter.introduction}!<br>`);
    //
    //   await this.clear();
    //
    //   let playerEncounterShuffle = shuffle(players);
    //
    //   type Action = { character: string; action: string; reaction?: string };
    //   let actions: Array<Action> = await Promise.all(
    //     playerEncounterShuffle.map(async (player, i) => {
    //       let character = characters.get(player)!;
    //       let action = `<b>${await promptPlayer(
    //         player,
    //         `In order to deal with ${encounter.name}, ${character.name}...`
    //       )}</b>`;
    //       return { character: character.name, action };
    //     })
    //   );
    //
    //   await Promise.all(
    //     playerEncounterShuffle.map(async (player, i) => {
    //       let action = actions[(i + 1) % actions.length];
    //       action.reaction = `<b>${await promptPlayer(
    //         player,
    //         `In order to deal with ${encounter.name}, ${action.character} ${action.action}. In reaction ${encounter.name}...`
    //       )}</b>`;
    //     })
    //   );
    //
    //   for (let action of actions) {
    //     await this.write(`${action.character} ${action.action}.<br>`);
    //     await this.write(`${encounter.name} ${action.reaction}.<br>`);
    //   }
    //
    //   await this.clear();
    //
    //   await this.write(
    //     `Having dealt with ${encounter.name}, your crew now leaves ${island.name}.`
    //   );
    //
    //   await this.clear();
    // }
    //
    // await this.write(`Exhasted, your crew is at their breaking point.<br>`);
    // await this.write(
    //   `${captainName}: It's hopeless! We'll never find ${treasureName}!<br>`
    // );
    // await this.write(`${captainName}: Wait, what's that!<br>`);
    // await this.write(`Suddenly in the distance, you see ${treasureName}!<br>`);
    // await this.write(`It was all worth it!<br>`);
    // await this.write(`You and your crew have done it!<br>`);
    //
    // await this.clear();
    // await this.writeTitle("THE END");
  }

  wait(seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), Math.floor(seconds * 1000));
    });
  }

  async writeTitle(title: string) {
    this.display.current!.innerHTML += `<h1>${title}</h1>`;
  }

  async write(text: string, delay: number = 4) {
    this.display.current!.innerHTML += text;
    await this.wait(delay);
  }

  async clear() {
    this.display.current!.innerHTML = "";
  }

  render() {
    return <div ref={this.display}></div>;
  }
}
