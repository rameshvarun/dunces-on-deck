import Peer from "peerjs";

import * as ReactDOM from "react-dom";
import * as React from "react";

import { generatePlayerID, unexpected } from "./utils";

import { RemoteState } from "./remotemanager";

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
    console.log("This is a remote...");

    super(props);
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

    this.conn!.send({
      requestID: this.state.remoteState.requestID,
      response: this.promptInput.current!.value
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
                if (div) div.innerHTML = prompt;
              }}
            ></div>
            <div>
              <input ref={this.promptInput} type="text"></input>
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
