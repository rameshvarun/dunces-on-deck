import Peer from "peerjs";

import * as ReactDOM from "react-dom";
import * as React from "react";

import { generatePlayerID, unexpected } from "./utils";

import { RemoteState } from "./remotemanager";
import { GIPHY_API_KEY } from "./constants";

const giphy = require("giphy-api")({
  https: true,
  apiKey: GIPHY_API_KEY
});

type RemoteComponentState =
  | { kind: "error"; error: any }
  | { kind: "connecting" }
  | { kind: "connected"; remoteState: RemoteState };

// @ts-ignore
console.log(`Running remote entry point, version ${VERSION}.`);

if (!window.localStorage.remoteID)
  window.localStorage.remoteID = generatePlayerID();
const REMOTE_ID = window.localStorage.remoteID;

console.log(`Remote ID: ${REMOTE_ID}...`);

class Timer extends React.Component<{ deadline: number }, {}> {
  interval: NodeJS.Timeout | null = null;

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      this.forceUpdate();
    }, 100);
  }
  componentWillUnmount() {
    clearInterval(this.interval!);
  }
  render() {
    let ms = Math.max(0, this.props.deadline - Date.now());
    let sec = Math.ceil(ms / 1000);
    // return <span>{sec} seconds left...</span>;
    return (
      <div
        style={{
          position: "fixed",
          right: "5px",
          bottom: "5px",
          background: "rgba(0, 0, 0, 0.7)"
        }}
      >
        <span
          style={{
            zIndex: 1,
            padding: "10px",
            display: "block",
            fontSize: "20px",
            color: "white"
          }}
        >
          {sec}s
        </span>
      </div>
    );
  }
}

class GIPHYSearch extends React.Component<
  { initialQuery?: string; onSubmit: (val: string | null) => void },
  { gifs: Array<string> }
> {
  searchInput: React.RefObject<HTMLInputElement> = React.createRef();

  constructor(props) {
    super(props);
    this.state = { gifs: [] };

    if (props.initialQuery) this.search(props.initialQuery);
  }
  render() {
    return (
      <>
        <div>
          <input
            ref={this.searchInput}
            type="text"
            defaultValue={this.props.initialQuery}
          ></input>
          <button onClick={() => this.search(this.searchInput.current!.value)}>
            Search
          </button>
          <button onClick={() => this.props.onSubmit(null)}>Skip</button>
        </div>
        <div>
          <img src={"../" + require("./images/powered-by-giphy.png")}></img>
        </div>
        <div>
          {this.state.gifs.map(gif => (
            <img
              style={{ padding: "5px", width: "100%", boxSizing: "border-box" }}
              key={gif}
              src={gif}
              onClick={() => {
                this.props.onSubmit(gif);
              }}
            ></img>
          ))}
        </div>
      </>
    );
  }
  async search(query) {
    let gifs = (
      await giphy.search({
        q: query,
        limit: 20
      })
    ).data;

    this.setState({
      gifs: gifs.map(g => g.images.fixed_width.url)
    });
  }
}

class TextInput extends React.Component<
  { onSubmit: (val: string) => void },
  {}
> {
  promptInput: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    return (
      <>
        <input ref={this.promptInput} type="text"></input>
        <button
          onClick={() => {
            this.props.onSubmit(this.promptInput.current!.value);
          }}
        >
          Submit
        </button>
      </>
    );
  }
}

function centered(content) {
  return (
    <div
      style={{
        textAlign: "center"
      }}
    >
      {content}
    </div>
  );
}

class Remote extends React.Component<{ room: string }, RemoteComponentState> {
  conn?: Peer.DataConnection;

  constructor(props) {
    super(props);

    console.log("This is a remote...");

    this.state = { kind: "connecting" };

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

  submitPrompt(value: string | null) {
    if (this.state.kind !== "connected")
      throw new Error("Remote must be connected.");
    if (this.state.remoteState.kind !== "prompt")
      throw new Error("Remote must be in prompt state.");

    this.conn!.send({
      requestID: this.state.remoteState.requestID,
      response: value
    });
    this.setState({
      kind: "connected",
      remoteState: { kind: "submitting" }
    });
  }

  render() {
    switch (this.state.kind) {
      case "connecting":
        return centered(<h1>Connecting to "{this.props.room}"...</h1>);
      case "connected":
        return this.connectedRender();
      case "error":
        return centered(
          <>
            <h1>{this.state.error.toString()}</h1>
            Try refreshing...
          </>
        );
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
        return centered(<h1>Waiting for host...</h1>);
      case "waiting-for-others":
        return centered(<h1>Waiting for other players...</h1>);
      case "look-up":
        return centered(<h1>Look Up</h1>);
      case "submitting":
        return centered(<h1>Submitting...</h1>);
      case "prompt":
        let prompt = state.prompt;
        return (
          <>
            <h2
              key="prompt-div"
              ref={div => {
                if (div) div.innerHTML = prompt.prompt;
              }}
            ></h2>
            <div>
              {prompt.kind == "text" && (
                <TextInput
                  onSubmit={value => {
                    this.submitPrompt(value);
                  }}
                />
              )}
              {prompt.kind == "giphy" && (
                <GIPHYSearch
                  initialQuery={prompt.search}
                  onSubmit={gif => {
                    this.submitPrompt(gif);
                  }}
                />
              )}
              <div>
                <Timer deadline={state.deadline} />
              </div>
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
