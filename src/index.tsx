import Peer from "peerjs";

import * as ReactDOM from "react-dom";
import * as React from "react";

import * as query from "query-string";

const ID_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 4
function generateRoomID(): string {
  let id = '';
  while(id.length < ID_LENGTH) {
    id += ID_CHARACTERS[Math.floor(Math.random() * ID_CHARACTERS.length)];
  }
  return id;
}

const PEERJS_CONFIG = {
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com"
      }
    ]
  }
};

const PARSED_HASH = query.parse(window.location.hash);
const isRemote = !!PARSED_HASH.room;
const isHost = !isRemote;

function shuffle<T>(unshuffled: Array<T>): Array<T> {
  let array = unshuffled.slice(0);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function promptPlayer(
  player: Peer.DataConnection,
  prompt: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    player.send({ kind: "prompt", prompt });
    //@ts-ignore
    player.once("data", msg => {
      resolve(msg);
    });
  });
}

class Game extends React.Component<
  { players: Array<Peer.DataConnection> },
  {}
> {
  display: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.display = React.createRef();

    this.runGame(props.players);
  }

  async runGame(players: Array<Peer.DataConnection>) {
    let shipName: string = "ERROR";
    let captainName: string = "ERROR";
    let treasureName: string = "ERROR";

    let pre_title_players = shuffle(players);
    await Promise.all(
      pre_title_players.map(async (player, i) => {
        if (i == (0 % players.length)) {
          shipName = `<b>The ${await promptPlayer(
            player,
            "The ship you are on is The..."
          )}</b>`;
        }

        if (i == (1 % players.length)) {
          captainName = `<b>Captain ${await promptPlayer(
            player,
            "The ship you are on is lead by Captain..."
          )}</b>`;
        }

        if (i == (2 % players.length)) {
          treasureName = `<b>The ${await promptPlayer(
            player,
            "Your party is traveling the oceans looking for The..."
          )}</b>`;
        }
      })
    );

    await this.writeTitle("DUNCES ON DECK");
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

    await this.write(`${captainName}: All hands on deck!<br>`);
    await this.write(`The crew emerge from their quarters.<br>`);
    await this.write(`${captainName}: Some of you seem to be new here so why don't you introduce yourselves.`);
    await this.clear();

    type Character = {name: string, introduction: string};

    let characters = new Map<Peer.DataConnection, Character>();
    await Promise.all(
      players.map(async (player, i) => {
         let name = `<b>${await promptPlayer(
            player,
            "You are roleplaying as character named..."
          )}</b>`;

          let introduction = `<b>${await promptPlayer(
            player,
            `When asked to introduce themselves, ${name} says...`
          )}</b>`;

          characters.set(player, {name, introduction});
      })
    );

    for (let {name, introduction} of characters.values()) {
      await this.write(`${name}: `);
      await this.write(`${introduction}<br>`);
    }

    await this.clear();

    await this.write(`${captainName}: Okay listen up crew!<br>`);
    await this.write(`${captainName}: Whatever the cost, whatever the struggle, I will find ${treasureName}!<br>`);
    await this.write(`${captainName}: I will go to the ends of the earth to find ${treasureName}!<br>`);
    await this.write(`${captainName}: Do you understand?<br>`);

    await this.write(`${captainName} is interrupted as a voice from the mast calls out "Land Ho!"<br>`);
    await this.clear();

    let playerIslandsShuffle = shuffle(players);
    let islands: Array<any> = await Promise.all(
      playerIslandsShuffle.map(async (player, i) => {
         let name = `<b>${await promptPlayer(
            player,
            "Your crew lands on an island named on your map as..."
          )}</b>`;

          let description = `<b>${await promptPlayer(
            player,
            `As the crew lands, they see that the island...`
          )}</b>`;

          return {name, description};
      })
    );

    await Promise.all(
      playerIslandsShuffle.map(async (player, i) => {
        let island = islands[(i + 1) % islands.length];

        let name = `<b>${await promptPlayer(
          player,
          `Your crew will land on an island named ${island.name}. When they land, they will see that the island ${island.description}. On this island they will encounter...`
        )}</b>`;

        let introduction = `<b>${await promptPlayer(
          player,
          `When your crew first comes across ${name}, it...`
        )}</b>`;

        island.encounter = {name, introduction};
      })
    );

    for (let island of islands) {
      await this.write(`Your crew sees an island in the distance.<br>`);
      await this.write(`${captainName} checks his map and finds the island marked as `);
      await this.write(`${island.name}.<br>`);

      await this.write(`As you land, you see that the island `);
      await this.write(`${island.description}.<br>`);
      await this.write(`Your party cautiously proceeds...<br>`);

      await this.clear();

      let encounter = island.encounter;

      await this.write(`Suddenly you come across `);
      await this.write(`${encounter.name}!<br>`);

      await this.write(`Before you can react, ${encounter.name} `);
      await this.write(`${encounter.introduction}!<br>`);

      await this.clear();

      let playerEncounterShuffle = shuffle(players);

      type Action = {character: string, action: string, reaction?: string};
      let actions: Array<Action> = await Promise.all(
        playerEncounterShuffle.map(async (player, i) => {
          let character = characters.get(player)!;
          let action = `<b>${await promptPlayer(
            player,
            `In order to deal with ${encounter.name}, ${character.name}...`
          )}</b>`;
          return {character: character.name, action}
        })
      );

      await Promise.all(
        playerEncounterShuffle.map(async (player, i) => {
          let action = actions[(i + 1) % actions.length];
          action.reaction = `<b>${await promptPlayer(
            player,
            `In order to deal with ${encounter.name}, ${action.character} ${action.action}. In reaction ${encounter.name}...`
          )}</b>`;
        })
      );

      for (let action of actions) {
        await this.write(`${action.character} ${action.action}.<br>`);
        await this.write(`${encounter.name} ${action.reaction}.<br>`);
      }

      await this.clear();

      await this.write(`Having dealt with ${encounter.name}, your crew now leaves ${island.name}.`);

      await this.clear();
    }

    await this.write(`Exhasted, your crew is at their breaking point.<br>`);
    await this.write(`${captainName}: It's hopeless! We'll never find ${treasureName}!<br>`);
    await this.write(`${captainName}: Wait, what's that!<br>`);
    await this.write(`Suddenly in the distance, you see ${treasureName}!<br>`);
    await this.write(`It was all worth it!<br>`);
    await this.write(`You and your crew have done it!<br>`);

    await this.clear();
    await this.writeTitle("THE END");
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

type HostState =
  | { kind: "creating-room" }
  | {
      kind: "waiting-for-players";
      room: string;
      players: Array<Peer.DataConnection>;
    }
  | { kind: "running-game"; players: Array<Peer.DataConnection> };

class Host extends React.Component<{}, HostState> {
  constructor(props) {
    console.log("This is a host...");
    super(props);

    this.state = { kind: "creating-room" };

    const peer = new Peer("dunces-on-deck", PEERJS_CONFIG);

    peer.on("error", err => console.error(err));

    peer.on("open", id => {
      console.log(`Peer ID: ${id}...`);
      this.setState(() => ({
        kind: "waiting-for-players",
        room: id,
        players: []
      }));
    });

    peer.on("connection", conn => {
      conn.on("open", () => {
        console.log("A client has connected...");

        this.setState(state =>
          // @ts-ignore
          ({ ...state, players: state.players.concat([conn]) })
        );
      });
    });
  }

  render() {
    switch (this.state.kind) {
      case "creating-room":
        return <>Creating a room...</>;
      case "waiting-for-players":
        let joinURL = `${window.location.href}#room=${this.state.room}`;
        return (
          <>
            <div>
              Players join at <a href={joinURL}>{joinURL}</a>
            </div>
            <div>({this.state.players.length}) Players Joined</div>
            {this.state.players.length >= 1 ? (
              <button onClick={() => this.setState({ kind: "running-game" })}>
                Start Game
              </button>
            ) : (
              <></>
            )}
          </>
        );
      case "running-game":
        return <Game players={this.state.players}></Game>;
    }
  }
}

type RemoteState =
  | { kind: "connecting" }
  | { kind: "waiting" }
  | { kind: "prompt"; prompt: "string" };

class Remote extends React.Component<{ room: string }, RemoteState> {
  promptInput: React.RefObject<HTMLInputElement>;
  conn?: Peer.DataConnection;

  constructor(props) {
    console.log("This is a remote...");

    super(props);
    this.state = { kind: "connecting" };

    this.promptInput = React.createRef();

    const peer = new Peer(PEERJS_CONFIG);
    peer.on("error", err => console.error(err));
    peer.on("open", id => {
      this.conn = peer.connect("dunces-on-deck");
      this.conn.on("open", () => {
        console.log("Host has connected...");
        this.setState(() => ({ kind: "waiting" }));
      });

      this.conn.on("data", msg => {
        switch (msg.kind) {
          case "prompt":
            this.setState(() => ({
              kind: "prompt",
              prompt: msg.prompt
            }));
            break;
        }
      });
    });
  }

  submitPrompt() {
    this.conn!.send(this.promptInput.current!.value);
    this.setState(() => ({ kind: "waiting" }));
  }

  render() {
    switch (this.state.kind) {
      case "connecting":
        return <>Connecting to {this.props.room}</>;
      case "waiting":
        return <>Waiting for host...</>;
      case "prompt":
        return (
          <>
            <div>{this.state.prompt}</div>
            <div>
              <input ref={this.promptInput} type="text"></input>
              <button onClick={() => this.submitPrompt()}>Submit</button>
            </div>
          </>
        );
    }
  }
}

type DeviceRole = { kind: "host" } | { kind: "remote"; room: string };

class App extends React.Component<{}, DeviceRole> {
  constructor(props) {
    super(props);

    this.state = isRemote
      ? { kind: "remote", room: PARSED_HASH.room as string }
      : { kind: "host" };
  }
  render() {
    return this.state.kind == "host" ? (
      <Host />
    ) : (
      <Remote room={PARSED_HASH.room as string} />
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
