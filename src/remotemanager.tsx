import Peer from "peerjs";

type PromptType =
  | {
      kind: "text";
      prompt: string;
      limit: number;
    }
  | {
      kind: "giphy";
      search: string;
      prompt: string;
    };

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
      deadline: number;
      prompt: PromptType;
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
      connections: Map<Player, Peer.DataConnection | null>;

      remoteState: Map<Player, RemoteState>;
      promptResolve: Map<Player, (string) => void>;
    };

// If a player submits an answer right on the deadline, then there answer will
// be ignored since latency will push it over the deadline. This defines a grace
// period, so that we still accept the answer a little bit past the deadline.
const ANSWER_TIMEOUT_GRACE_PERIOD = 1000;

import { PEERJS_CONFIG } from "../config";

export class RemoteManager {
  roomID: string;
  state: RemoteManagerState;
  requestID: number = 0;

  onLobbyUpdate?: (players: Array<Player>) => void;

  constructor(roomID: string, onCreateRoom: () => void) {
    this.roomID = roomID;
    this.state = { kind: "lobby", connections: new Map() };

    const peer = new Peer(`dunces-on-deck-${roomID}`, PEERJS_CONFIG);

    peer.on("error", err => console.error(err));

    peer.on("open", id => {
      console.log(`Peer ID: ${id}...`);
      onCreateRoom();
    });

    peer.on("connection", conn => {
      let player = conn.metadata;

      conn.on("open", () => {
        console.log(`Player ${player} has connected...`);
        switch (this.state.kind) {
          case "lobby":
            // If a player joins during the lobby phase, we simply add them to the Map of players.
            this.state.connections.set(player, conn);
            // Signal to UI that the lobby has been updated.
            if (this.onLobbyUpdate)
              this.onLobbyUpdate(Array.from(this.state.connections.keys()));
            // Tell the player that we are waiting for the host.
            conn.send({ kind: "waiting-for-host" });
            break;
          case "game":
            if (this.state.connections.has(player)) {
              // If this is a known player, replace connection in map.
              this.state.connections.set(player, conn);

              // If we have a stored state for this player, send that state.
              let remoteState = this.state.remoteState.get(player);
              if (remoteState) conn.send(remoteState);
            } else {
              // If this is an unknown player, reject them since players cannot join a game in progress.
              console.log(
                `Player ${player} tried to join a game in progress. Denying connection.`
              );
              conn.close();
            }
            break;
        }
      });

      conn.on("close", () => {
        console.log(`Player ${conn.metadata} has disconnected...`);
        switch (this.state.kind) {
          case "lobby":
            // In the lobby phase, if the current connection is the one that
            // disconnected, delete the connection.
            if (this.state.connections.get(player) === conn)
              this.state.connections.delete(player);
            // Signal to UI that the lobby has been updated.
            if (this.onLobbyUpdate)
              this.onLobbyUpdate(Array.from(this.state.connections.keys()));
            break;
          case "game":
            // During the game phase, if the current connection is the one that
            // disconnected, set the connection to null.
            if (this.state.connections.get(player) === conn)
              this.state.connections.set(player, null);
            break;
        }
      });

      conn.on("data", (msg: RemoteResponse) => {
        switch (this.state.kind) {
          case "game":
            let currentConnection = this.state.connections.get(player);
            let remoteState = this.state.remoteState.get(player);

            // 1. The connection we received data on is current.
            // 2. The current state of the remote is a prompt.
            // 3. The requestID of the response matches the requestID of the prompt.
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
  promptPlayer(
    player: Player,
    prompt: PromptType,
    defaultValue: string | Promise<string>,
    timeout: number = 60 * 1000
  ): Promise<string> {
    if (this.state.kind !== "game")
      throw new Error(`Can only call this function in the 'game' state.`);

    let requestID = this.requestID++;
    let promptMsg: RemoteState = {
      kind: "prompt",
      prompt,
      requestID,
      deadline: Date.now() + timeout
    };

    this.state.remoteState.set(player, promptMsg);
    return new Promise<string | null>((resolve, reject) => {
      if (this.state.kind !== "game")
        throw new Error(`Can only prompt remotes in 'game' state.`);
      this.state.promptResolve.set(player, resolve);

      let conn = this.state.connections.get(player);
      if (conn) conn.send(promptMsg);

      setTimeout(() => resolve(null), timeout + ANSWER_TIMEOUT_GRACE_PERIOD);
    }).then(res => {
      if (res && typeof res === "string" && res.trim() !== "") return res;
      else return defaultValue;
    });
  }

  // Signal to this player that he is waiting on other players.
  waitingForOthers(player: Player) {
    if (this.state.kind !== "game")
      throw new Error(`Can only call this function in the 'game' state.`);

    let remoteState: RemoteState = { kind: "waiting-for-others" };
    this.state.remoteState.set(player, remoteState);

    let conn = this.state.connections.get(player);
    if (conn) conn.send(remoteState);
  }

  // Signal all players to look up at the screen.
  lookUp() {
    if (this.state.kind !== "game")
      throw new Error(`Can only call this function in the 'game' state.`);

    for (let player of this.getPlayers()) {
      let remoteState: RemoteState = { kind: "look-up" };
      this.state.remoteState.set(player, remoteState);

      let conn = this.state.connections.get(player);
      if (conn) conn.send(remoteState);
    }
  }
}
