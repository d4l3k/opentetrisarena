import {BoardState} from '../boardstate';

export interface Message {
  hello?: Hello;
  welcome?: Welcome;
  sendChat?: SendChat;
  receiveChat?: ReceiveChat;
  start?: Start;
  stop?: Stop;
  boardStates?: {[id: string]: BoardState};
  players?: {[id: string]: Player};
  addLines?: AddLines;
  sendLines?: SendLines;
}

/**
 * Start indicates that the client should start a game with the specified
 * settings.
 */
export interface Start {}

export interface Stop { message?: string }

export interface SendLines {
  to: string
  count: number
}

export interface AddLines {
  count: number
  solid: boolean
}

/**
 * Hello is sent from client to host upon first connecting.
 */
export interface Hello { name: string; }

/**
 * Welcome is sent from host to client in response to a Hello.
 */
export interface Welcome { playerId: string; }

export interface SendChat { text: string; }

export interface ReceiveChat {
  timestamp: number;
  playerId?: string;
  name?: string;
  announce?: boolean;
  text: string;
}

export interface Player {
  id: string
  name: string
  wins: number
  games: number
  over: boolean
  linesSent: number
  timeAlive: number
}
