import Peer from "peerjs";

import * as ReactDOM from "react-dom";
import * as React from "react";

import { generatePlayerID, unexpected } from "./utils";

import { RemoteState } from "./remotemanager";
import { Selector } from "react-giphy-selector";

const GIPHY_API_KEY = "U1SoxcX7Tcwmavn0ySOgbzhrIoDVn8gb";

type RemoteComponentState =
  | { kind: "error"; error: any }
  | { kind: "connecting" }
  | { kind: "connected"; remoteState: RemoteState };

if (!window.localStorage.remoteID)
  window.localStorage.remoteID = generatePlayerID();
const REMOTE_ID = window.localStorage.remoteID;

console.log(`Remote ID: ${REMOTE_ID}...`);

class Remote extends React.Component<{ room: string }, RemoteComponentState> {
  promptInput: React.RefObject<HTMLInputElement>;
  conn?: Peer.DataConnection;

  constructor(props) {
    super(props);

    console.log("This is a remote...");

    this.state = { kind: "connecting" };

    this.promptInput = React.createRef();

    const peer = new Peer();

    peer.on("error", error => {
      console.error(error);
      this.setState(() => ({ kind: "error", error }));
    });
    peer.on("open", id => {
      this.conn = peer.connect(`dunces-on-deck-${props.room}`, {
        serialization: "json",
        reliable: true,
        metadata: REMOTE_ID
      });
      this.conn.on("open", () => {
        console.log("Host has connected...");
      });
      this.conn.on("data", (msg: RemoteState) => {
        console.log(msg);
        this.setState({
          kind: "connected",
          remoteState: msg
        });
      });
      this.conn.on("error", error => {
        console.error(error);
        this.setState(() => ({ kind: "error", error }));
      });
    });
  }

  submitPrompt() {
    if (this.state.kind !== "connected")
      throw new Error("Remote must be connected.");
    if (this.state.remoteState.kind !== "prompt")
      throw new Error("Remote must be in prompt state.");

    let response: string | null = null;
    switch (this.state.remoteState.prompt.kind) {
      case "text":
        response = this.promptInput.current!.value;
        break;
      case "giphy":
        response = this.selectedGIF;
        this.selectedGIF = null;
        break;
      default:
        unexpected(this.state.remoteState.prompt);
    }

    this.conn!.send({
      requestID: this.state.remoteState.requestID,
      response
    });
    this.setState({
      kind: "connected",
      remoteState: { kind: "submitting" }
    });
  }

  render() {
    switch (this.state.kind) {
      case "connecting":
        return <h1>Connecting to "{this.props.room}"...</h1>;
      case "connected":
        return this.connectedRender();
      case "error":
        return <h1>{this.state.error.toString()}</h1>;
      default:
        return unexpected(this.state);
    }
  }

  selectedGIF: string | null = null;

  connectedRender() {
    if (this.state.kind !== "connected")
      throw new Error("Remote must be connected.");

    let state = this.state.remoteState;
    switch (state.kind) {
      case "waiting-for-host":
        return <h1>Waiting for host...</h1>;
      case "waiting-for-others":
        return <h1>Waiting for other players...</h1>;
      case "look-up":
        return <h1>Look Up!</h1>;
      case "submitting":
        return <h1>Submitting...</h1>;
      case "prompt":
        let prompt = state.prompt;
        return (
          <>
            <div
              ref={div => {
                if (div) div.innerHTML = prompt.prompt;
              }}
            ></div>
            <div>
              {prompt.kind == "text" && (
                <input ref={this.promptInput} type="text"></input>
              )}
              {prompt.kind == "giphy" && (
                <Selector
                  apiKey={GIPHY_API_KEY}
                  onGifSelected={gif => {
                    this.selectedGIF = gif.images.fixed_height.gif_url;
                    this.forceUpdate();
                  }}
                />
              )}
              {this.selectedGIF && <img src={this.selectedGIF}></img>}
              <button onClick={() => this.submitPrompt()}>Submit</button>
            </div>
          </>
        );
      default:
        return unexpected(state);
    }
  }
}

const ROOM_ID = window.location.hash.substring(1);
ReactDOM.render(<Remote room={ROOM_ID} />, document.getElementById("root"));
