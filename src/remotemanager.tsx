import Peer from "peerjs";

export type Player = string;

export type RemoteState =
  | {
      kind: "waiting-for-host";
    }
  | {
      kind: "waiting-for-others";
    }
  | {
      kind: "look-up";
    }
  | {
      kind: "prompt";
      requestID: number;
      prompt: string;
    }
  | {
      kind: "submitting";
    };

export type RemoteResponse = {
  requestID: number;
  response: string;
};

export type RemoteManagerState =
  | {
      kind: "lobby";
      connections: Map<Player, Peer.DataConnection>;
    }
  | {
      kind: "game";
      connections: Map<Player, Peer.DataConnection>;

      remoteState: Map<Player, RemoteState>;
      promptResolve: Map<Player, (string) => void>;
    };

export class RemoteManager {
  roomID: string;
  state: RemoteManagerState;
  requestID: number = 0;

  onLobbyUpdate?: (players: Array<Player>) => void;

  constructor(roomID: string, onCreateRoom: () => void) {
    this.roomID = roomID;
    this.state = { kind: "lobby", connections: new Map() };

    const peer = new Peer(`dunces-on-deck-${roomID}`);

    peer.on("error", err => console.error(err));

    peer.on("open", id => {
      console.log(`Peer ID: ${id}...`);
      onCreateRoom();
    });

    peer.on("connection", conn => {
      let player = conn.metadata;
      conn.on("open", () => {
        console.log(`Player ${player} has connected...`);
        this.state.connections.set(player, conn);

        if (this.state.kind === "lobby" && this.onLobbyUpdate)
          this.onLobbyUpdate(Array.from(this.state.connections.keys()));

        if (this.state.kind === "game") {
          let remoteState = this.state.remoteState.get(player);
          if (remoteState) conn.send(remoteState);
        }
      });

      conn.on("close", () => {
        console.log(`Player ${conn.metadata} has disconnected...`);
        if (this.state.connections.get(conn.metadata) === conn)
          this.state.connections.delete(conn.metadata);
      });

      conn.on("data", (msg: RemoteResponse) => {
        switch (this.state.kind) {
          case "game":
            let currentConnection = this.state.connections.get(player);
            let remoteState = this.state.remoteState.get(player);
            if (
              currentConnection === conn &&
              remoteState &&
              remoteState.kind == "prompt" &&
              remoteState.requestID == msg.requestID
            ) {
              let resolve = this.state.promptResolve.get(player)!;
              resolve(msg.response);
            }
            break;
        }
      });
    });
  }

  startGame() {
    this.state = {
      kind: "game",
      connections: this.state.connections,
      remoteState: new Map(),
      promptResolve: new Map()
    };
  }

  getPlayers(): Array<Player> {
    return Array.from(this.state.connections.keys());
  }

  // Prompt this player to enter in a string.
  promptPlayer(player: Player, prompt: string): Promise<string> {
    if (this.state.kind !== "game")
      throw new Error(`Can call this function in the 'game' state.`);

    let requestID = this.requestID++;
    let promptMsg: RemoteState = { kind: "prompt", prompt, requestID };

    this.state.remoteState.set(player, promptMsg);
    return new Promise((resolve, reject) => {
      if (this.state.kind !== "game")
        throw new Error(`Can only prompt remotes in 'game' state.`);
      this.state.promptResolve.set(player, resolve);

      let conn = this.state.connections.get(player);
      if (conn) conn.send(promptMsg);
    });
  }

  // Signal to this player that he is waiting on other players.
  waitingForOthers(player: Player) {
    if (this.state.kind !== "game")
      throw new Error(`Can call this function in the 'game' state.`);

    let remoteState: RemoteState = { kind: "waiting-for-others" };
    this.state.remoteState.set(player, remoteState);

    let conn = this.state.connections.get(player);
    if (conn) conn.send(remoteState);
  }

  // Signal all players to look up at the screen.
  lookUp() {
    if (this.state.kind !== "game")
      throw new Error(`Can call this function in the 'game' state.`);

    for (let player of this.getPlayers()) {
      let remoteState: RemoteState = { kind: "look-up" };
      this.state.remoteState.set(player, remoteState);

      let conn = this.state.connections.get(player);
      if (conn) conn.send(remoteState);
    }
  }
}
