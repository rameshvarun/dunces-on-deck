import Peer from "peerjs";

import * as ReactDOM from "react-dom";
import * as React from "react";
import * as QRCode from "qrcode";

import { shuffle, generateRoomID } from "./utils";
import { Game } from "./game";

import { RemoteManager, Player } from "./remotemanager";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

// @ts-ignore
console.log(`Running host entry point, version ${VERSION}.`);

type HostState =
  | { kind: "creating-room"; remoteManager: RemoteManager }
  | {
      kind: "waiting-for-players";
      room: string;
      players: Array<Player>;
      remoteManager: RemoteManager;
    }
  | { kind: "running-game"; remoteManager: RemoteManager };

class Host extends React.Component<{}, HostState> {
  constructor(props) {
    console.log("This is a host...");
    super(props);

    let roomID =
      process.env.NODE_ENV === "development" ? "devroom" : generateRoomID();
    let remoteManager = new RemoteManager(roomID, () => {
      this.setState({
        kind: "waiting-for-players",
        room: roomID,
        players: [],
        remoteManager
      });
    });

    this.state = { kind: "creating-room", remoteManager };

    remoteManager.onLobbyUpdate = players => {
      if (this.state.kind == "waiting-for-players")
        this.setState({ kind: "waiting-for-players", players, remoteManager });
    };
  }

  startGame() {
    this.state.remoteManager.startGame();
    this.setState({
      kind: "running-game",
      remoteManager: this.state.remoteManager
    });
  }

  render() {
    switch (this.state.kind) {
      case "creating-room":
        return <h1>Creating a room...</h1>;
      case "waiting-for-players":
        let joinURL =
          window.location.protocol +
          "//" +
          window.location.hostname +
          (window.location.port ? ":" + window.location.port : "") +
          window.location.pathname +
          "join/#" +
          this.state.room;
        return (
          <>
            <h1
              className='title'
              style={{
                fontSize: "10vmin",
                marginBottom: 0
              }}
            >
              Dunces on Deck
            </h1>
            <div
              style={{
                marginTop: "2vmin"
              }}
            >
              Join with your phone at <a href={joinURL}>{joinURL}</a>
            </div>
            <img
              style={{
                marginTop: "2vmin",
                width: "30vmin"
              }}
              ref={img => {
                if (img) {
                  QRCode.toDataURL(joinURL, (err, val) => {
                    img.src = val;
                  });
                }
              }}
            ></img>
            <div
              style={{
                marginTop: "2vmin"
              }}
            >
              ({this.state.players.length}) Players Joined
            </div>
            {this.state.players.length >= 1 ? (
              <button
                style={{
                  marginTop: "2vmin"
                }}
                onClick={() => this.startGame()}
              >
                Start Game
              </button>
            ) : (
              <></>
            )}
            <div
              style={{
                position: "fixed",
                left: "0px",
                bottom: "0px",
                paddingBottom: "10px",
                paddingLeft: "20px",
                textAlign: "left",
                fontSize: "1rem"
              }}
            >
              <div>{VERSION}</div>
              <div>
                Created by{" "}
                <a href="https://www.varunramesh.net">Varun Ramesh</a>
              </div>
              <div>
                Featuring music by{" "}
                <a href="https://www.matthewpablo.com">Matthew Pablo</a>
              </div>
            </div>
          </>
        );
      case "running-game":
        return <Game remoteManager={this.state.remoteManager}></Game>;
    }
  }
}

const Container = () => {
  return (
    <>
      <div
        style={{
          margin: "10vmin",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          alignItems: "center",
          fontSize: "3vmin"
        }}
      >
        <Host />
      </div>

      <div
        style={{
          position: "fixed",
          right: "0px",
          bottom: "0px",
          fontSize: "40px",
          paddingBottom: "10px",
          paddingRight: "20px"
        }}
      >
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (window!.document!.fullscreen) {
              window!.document!.exitFullscreen();
            } else {
              window!.document!.documentElement!.requestFullscreen();
            }
          }}
        >
          <FontAwesomeIcon style={{ margin: "10px" }} icon={faExpand} />
        </span>
      </div>
    </>
  );
};

ReactDOM.render(<Container />, document.getElementById("root"));
