import {Bet, SUITS} from "~/src/AirPoker"

type BET = typeof Bet[keyof typeof Bet]

interface Card {
  number: number
  suit: SUITS
}
interface Log {
  selected: number
  pairs: Card[]
  bet: BET
  betAir: number
  // todo 以下はなくても算出できる。整合性重視して無くしたい
  air: number
  win: boolean
  disaster: boolean
}
interface Player {
  air: number
  betAir: number
  bet: BET
  selected: number
  pairs: Card[] | null
  logs: Log[]
}
interface You extends Player {
  id: string
  hand: number[]
}
interface Timer {
  deadline: number
  betLine: number
}
interface AirPokerBase {
  cards: Record<number, SUITS[]>
}
interface AirPokerResponse extends AirPokerBase, Timer {
  you: You
  opponent: Player
  isFirst: boolean
  isBet: boolean
  betCandidates: BET[]
}
interface AirPokerData extends AirPokerBase {
  players: You[]
  firstBet: string // player.id
  betPlayer: string // player.id
}
interface AirPokerStore extends AirPokerData, Timer {
  lock: null | string
}