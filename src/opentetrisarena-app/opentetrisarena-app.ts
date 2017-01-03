///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

import {BoardState} from '../boardstate';
import {Connection} from '../net/connection';
import {Loopback} from '../net/loopback';
import {Message, Player} from '../net/message';
import {decodeRSD, encodeRSD, WebRTCConnection} from '../net/webrtc';
import {TetrisEngine} from '../tetris-engine';
import {RTC_CONFIG} from '../webrtc-config';

const BOARD_UPDATE_TIME = 1000;
const BOARD_UNBREAKABLE_INTERVAL = 12000;

@component('opentetrisarena-app')
class OpenTetrisArena extends polymer.Base {
  private state: TetrisEngine = new TetrisEngine();
  private subStates: BoardState[] = [];
  private idToSubState: {[id: string]: number} = {};
  private ingame: boolean = false;
  private welcome: boolean = true;
  private ishost: boolean = false;
  private name: string;
  private serverHidden: boolean = true;
  private remoteConns: {[id: string]: Connection} = {};
  private boardStates: {[id: string]: BoardState} = {};
  private conn: Connection;
  private nextPlayerID: number = 1;
  private token: string;
  private players: {[id: string]: Player} = {};
  private remotePlayers: {[id: string]: Player} = {};
  private message: string;

  private lastInterval;
  private lastUnbreakableInterval;

  start() {
    this.stop();
    this.message = null;

    this.state = new TetrisEngine();

    this.lastInterval = setInterval(() => {
      this.state.tick();
      this.notifyState();
      this.sendState();

      if (this.state.over) {
        this.stop();
      }
    }, BOARD_UPDATE_TIME);

    this.lastUnbreakableInterval = setInterval(() => {
      this.broadcast({addLines: {count: 1, solid: true}}, true);
    }, BOARD_UNBREAKABLE_INTERVAL);
  }

  stop() {
    if (this.lastInterval) {
      clearInterval(this.lastInterval);
      this.lastInterval = null;
    }
    if (this.lastUnbreakableInterval) {
      clearInterval(this.lastUnbreakableInterval);
      this.lastUnbreakableInterval = null;
    }
  }

  sendStart() {
    for (let id in this.remotePlayers) {
      const player = this.remotePlayers[id];
      player.games++;
      player.over = false;
    }
    this.broadcastPlayers();
    this.broadcast({start: {}}, true);
  }

  sendStop(message: string = null) { this.broadcast({stop: {message}}, true); }

  sendState() { this.conn.send({boardStates: {'board': this.state}}, false); }

  broadcast(msg: Message, reliable: boolean) {
    for (let id in this.remoteConns) {
      const conn = this.remoteConns[id];
      conn.send(msg, reliable);
    }
  }

  host() {
    if (!this.hasValidName()) {
      return;
    }

    const loopback = new Loopback();
    loopback.open();
    this.addConnection(loopback.b);
    this.setConnection(loopback.a);

    this.ishost = true;

    // Wait for dom-if to propagate.
    setTimeout(() => {
      (this.shadowRoot.querySelector('#lobby') as any).offer =
          (offer: {Offer: string}, resolve: (any) => void) => {
            this.onOffer(offer.Offer).then((answer: string) => {
              resolve({Answer: answer});
            });
          };
    }, 1);

    setInterval(() => {
      if (Object.keys(this.boardStates).length == 0) {
        return;
      }
      this.broadcast({boardStates: this.boardStates}, false);
      this.boardStates = {};
    }, BOARD_UPDATE_TIME);
  }

  join() {
    if (!this.hasValidName()) {
      return;
    }

    const con = new WebRTCConnection(RTC_CONFIG);

    con.onOpen = () => { this.setConnection(con); };

    con.makeOffer()
        .then(
            offer => (this.shadowRoot.querySelector('#lobbyList') as any)
                         .connect(this.token, encodeRSD(offer), ''))
        .then((resp: {Answer: string}) => {
          return con.takeAnswer(decodeRSD(resp.Answer));
        })
        .catch(err => {
          con.onOpen = null;
          console.log(err);
        });
  }

  hasValidName(): boolean {
    if (!this.name || !this.name.length) {
      alert('Please enter a name!');
      return false;
    }
    return true;
  }

  onOffer(offer: string): Promise<string> {
    console.log('host-wrapper: got offer');
    const conn = new WebRTCConnection(RTC_CONFIG);
    conn.onOpen = () => { this.addConnection(conn); };
    return conn.takeOffer(decodeRSD(offer)).then(answer => {
      return encodeRSD(answer);
    });
  }

  setConnection(conn: Connection) {
    this.conn = conn;
    this.ingame = true;
    this.welcome = false;
    let playerID = null;
    conn.onMessage = (msg: Message, reliable: boolean, bytes: number) => {
      console.log('client <-', msg, reliable, bytes);

      if (msg.start) {
        this.start();
      }

      if (msg.stop) {
        this.stop();
        if (msg.stop.message) {
          this.message = msg.stop.message;
        }
      }

      if (msg.welcome) {
        playerID = msg.welcome.playerId;
      }

      if (msg.boardStates) {
        for (let id in msg.boardStates) {
          if (id != playerID) {
            let idx = this.idToSubState[id];
            const state = msg.boardStates[id];
            state.id = id;
            if (idx == undefined) {
              this.idToSubState[id] = this.subStates.length;
              this.push('subStates', state);
            } else {
              this.set(['subStates', idx], state);
            }
          }
        }
      }

      if (msg.players) {
        this.players = null;
        this.players = msg.players;
      }

      if (msg.addLines) {
        this.state.addLinesToBottom(msg.addLines.count, msg.addLines.solid);
      }
    };

    conn.onClose = () => {
      alert('Connection lost!');
      this.stop();
    };

    conn.send({hello: {name: this.name}}, true);
  }

  playerName(id: string): string { return this.players[id].name; }

  broadcastPlayers() { this.broadcast({players: this.remotePlayers}, true); }

  addConnection(conn: Connection) {
    const playerID = this.nextPlayerID + '';
    this.nextPlayerID++;

    this.remoteConns[playerID] = conn;

    conn.onMessage = (msg: Message, reliable: boolean, bytes: number) => {
      console.log('server <-', msg, reliable, bytes);

      if (msg.hello) {
        conn.send({welcome: {playerId: playerID}}, true);
        this.remotePlayers[playerID] = {
          id: playerID,
          name: msg.hello.name,
          wins: 0,
          games: 0,
          linesSent: 0,
          timeAlive: 0,
          over: true,
        };
        this.broadcastPlayers();
      }

      if (msg.boardStates) {
        const state = msg.boardStates['board'];
        this.remotePlayers[playerID].over = state.over;
        this.boardStates[playerID] = state;
        this.checkForWin();
      }
    };

    conn.onClose = () => {
      delete this.remoteConns[playerID];
      delete this.remotePlayers[playerID];
      this.broadcastPlayers();
    }
  }

  notifyState() {
    var state = this.state;
    this.state = null;
    this.state = state;
  }

  checkForWin() {
    const numPlayers = Object.keys(this.remotePlayers).length;
    if (numPlayers <= 1) {
      return;
    }

    let numAlive = 0;
    let winner = null;
    for (let id in this.remotePlayers) {
      const player = this.remotePlayers[id];
      if (!player.over) {
        numAlive++;
        winner = id;
      }
    }
    if (numAlive <= 1) {
      if (winner) {
        const player = this.remotePlayers[winner];
        player.wins++;
        player.over = true;
        this.broadcastPlayers();
        this.sendStop(player.name + ' has won!');
      } else {
        this.sendStop('No one has won!');
      }
    }
  }

  attached() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  detached() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (!this.ingame) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        this.state.left();
        break;

      case 'ArrowRight':
        this.state.right();
        break;

      case 'ArrowUp':
        this.state.rotate();
        break;

      case 'ArrowDown':
        this.state.down();
        break;

      case 'Shift':
        this.state.swap();
        break;

      case ' ':
        this.state.place();
        break;

      default:
        console.log('keydown', e);
        return;
    }

    e.preventDefault();
    this.notifyState();
  }

  toArr<T>(items: {[id: string]: T}): T[] {
    const arr: T[] = [];
    for (let id in items) {
      arr.push(items[id]);
    }
    return arr;
  }
}

OpenTetrisArena.register();
