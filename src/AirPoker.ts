import type {AirPokerData, AirPokerBase, Player, Card, You, BET, Log} from './index.d'
export const sumMax = 65
export const INIT_AIR = 24 // = 25 - 1
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const buffer = 1 * 1000
export const msecLimit = {
  buffer,
  select: 60 * 1000 + buffer,
  bet: 30 * 1000 + buffer,
  pairs: 100 * 1000 + buffer,
}
export enum Step {
  end,
  select,
  bet,
  judge,
}
export enum SUITS {
  HEART = 'HEART',
  DIAMOND = 'DIAMOND',
  SPADE = 'SPADE',
  CLUB = 'CLUB',
}
export const Bet = {
  NONE: '',
  CHECK: 'CHECK',
  RAISE: 'RAISE',
  CALL: 'CALL',
  FOLD: 'FOLD',
} as const
export enum RANK {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  RoyalStraight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalStraightFlush,
}


const asc = (a: number, b: number) => a - b
export class FieldError extends Error {
  code: string
  constructor(e: string) {
    super(e)
    this.code = e
  }
}

export default class AirPoker {
  data: AirPokerBase

  constructor() {
    this.data = {} as any
    this.data.cards = {}
    for (const num of NUMBERS) {
      this.data.cards[num] = [SUITS.HEART, SUITS.DIAMOND, SUITS.SPADE, SUITS.CLUB]
    }
  }

  getStep([a, b]: [You, Player]) {
    const round = this.getRound(a)
    if (round > 5 || a.air < 0 || b.air < 0) return Step.end
    if (a.selected === 0 || b.selected === 0) return Step.select
    if (a.bet === Bet.FOLD || b.bet === Bet.FOLD ||
      (Array.isArray(a.pairs) && Array.isArray(b.pairs) && (
      a.bet === Bet.CALL || b.bet === Bet.CALL ||
      (a.bet === Bet.CHECK && b.bet === Bet.CHECK)))
    ) return Step.judge
    return Step.bet
  }

  getRound(p: You) {
    let count = p.hand.reduce((p, v) => v === 0 ? p : p+1, 0)
    count = p.selected > 0 ? count + 1 : count
    return 5 - count + 1
  }

  firstInit({id}: {id: string}) {
    if (id.length === 0) throw new FieldError('invalid_data')
    const hands = this.initHands_()
    const self: AirPokerData = {...this.data,
      players: [],
      betPlayer: '',
      firstBet: '',
    }
    for (let i=0;i<2;i++) {
      self.players.push({
        id: i === 0 ? id : '',
        hand: hands[i],
        air: INIT_AIR,
        betAir: 0,
        bet: Bet.NONE,
        selected: 0,
        pairs: null,
        logs: [],
      })
    }
    return self
  }

  secondInit(self: AirPokerData, {id}: {id: string}) {
    if (id.length === 0) throw new FieldError('invalid_id')
    const secondIdx = self.players.findIndex(v=>v.id==='')
    if (secondIdx < 0 ||
      self.players[(secondIdx+1)%2].id === id) throw new FieldError('invalid_data')
    self.players[secondIdx].id = id
    return self
  }

  // fieldデータに変更がある場合に直前のstepを添えて返す
  next(self: AirPokerData, params: any) {
    let step = null
    if (this.getStep(self.players as [You, Player]) === Step.select) {
      if (typeof params.cardIdx === 'number') self = this.setCard_(self, params)
      if (this.getStep(self.players as [You, Player])  === Step.bet) {
        self = this.initBet_(self)
        return {step: Step.select, data: self}
      }
      return {step, data: self}
    }
    // @ts-ignore
    if (self.betPlayer === params.id && Bet[params.bet]) {
      self = this.bet_(self, params)
      step = Step.bet
    } else if (Array.isArray(params.pairs)) self = this.makePairs_(self, params)
    if (this.getStep(self.players as [You, Player]) === Step.judge) {
      return {step: Step.judge, data: this.nextRound_(self)}
    }
    return {step, data: self}
  }

  /*
   * initHands_
   *   Sums up five card numbers.
   */
  private initHands_(): number[][] {
    const hands = []
    const cardMap: Record<string, number> = {}
    for (const n of NUMBERS) cardMap[n] = 0
    for (let i = 0; i < 2; i++) {
      const hand = []
      for (let j = 0; j < 5; j++) {
        let sumup = 0
        let count = 0
        while (1) {
          const nums = Object.keys(cardMap)
          const i = Math.floor(Math.random() * nums.length)
          const n = nums[i]
          if (++cardMap[n] === 5) {
            delete cardMap[n]
            continue
          }
          sumup += +n
          if (++count === 5) break
        }
        hand.push(sumup)
      }
      hands.push(hand)
    }
    return hands
  }

  private setCard_(self: AirPokerData, {cardIdx, id}: {cardIdx: number, id: string}) {
    const you = self.players.find(v=>v.id===id)
    if (!you || you.selected > 0) throw new FieldError('invalid_id')
    you.selected = you.hand[cardIdx]
    if (!you.selected) throw new FieldError('invalid_data')
    you.hand[cardIdx] = 0
    return self
  }

  /*
   *   Pays entry fee according to every round
   */
  private initBet_(self: AirPokerData) {
    const round = this.getRound(self.players[0])
    for (const p of self.players) {
      p.air -= round
      if (p.air < 0) throw new FieldError('invalid_data')
      p.betAir += round
    }
    const [p, p2] = self.players
    if (round === 1) {
      if (p.selected === p2.selected) self.firstBet = p.id < p2.id ? p.id : p2.id // ランダム
      else self.firstBet = p.selected < p2.selected ? p.id : p2.id
    }
    self.betPlayer = self.firstBet
    return self
  }

  betCandidates(a: Player, b: Player, aBetNow: boolean): BET[] {
    const canRaise = this.getMaxRaise(a, b) > 0
    let prev = a
    let now = b
    if (aBetNow) {
      now = a
      prev = b
    }
    if (now.bet === Bet.NONE &&
      (prev.bet === Bet.NONE || prev.bet === Bet.CHECK))
      return canRaise ? [Bet.CHECK, Bet.RAISE] : [Bet.CHECK]
    else if (prev.bet === Bet.RAISE)
      return canRaise ? [Bet.FOLD, Bet.CALL, Bet.RAISE] : [Bet.FOLD, Bet.CALL]
    return []
  }

  getMaxRaise(a: Player, b: Player) {
    let totalTips = a.betAir + b.betAir
    return Math.min(
      a.air,
      b.air,
      Math.floor(totalTips / 2)
    )
  }

  private bet_(self: AirPokerData, {bet, tip = 0}: {bet: BET, tip?: number}) {
    const youIdx = self.players.findIndex(v=>v.id===self.betPlayer)
    if (youIdx < 0) throw new FieldError('invalid_id')
    const opponent = self.players[(youIdx+1)%2]
    const you = self.players[youIdx]
    const candidates = this.betCandidates(you, opponent, true)
    if (!candidates.includes(bet)) bet = candidates[0] // XXX for time-up
    you.bet = bet
    self.betPlayer = this.betCandidates(opponent, you, true).length === 0 ? '' : opponent.id
    if (bet === Bet.RAISE) {
      if (!(tip > 0) || tip > this.getMaxRaise(you, opponent)) throw new FieldError('invalid_data')
      you.air -= (opponent.betAir - you.betAir) + tip
      you.betAir = opponent.betAir + tip
    } else if (bet === Bet.CALL) {
      you.air -= opponent.betAir - you.betAir
      you.betAir = opponent.betAir
    }
    return self
  }

  private makePairs_(self: AirPokerData, {pairs, id}: {pairs: Card[], id: string}) {
    const you = self.players.find(v=>v.id===id)
    if (!you || Array.isArray(you.pairs) || !Array.isArray(pairs) ||
      (pairs.length !== 5 && pairs.length !== 0)) throw new FieldError('invalid_pair')
    let sum = 0
    const isSameCard: any = {}
    for (const c of pairs) {
      if (!NUMBERS.includes(c.number) || !self.cards[c.number].includes(c.suit) ||
        isSameCard[c.number] === c.suit) {
        sum = -1
        break
      }
      isSameCard[c.number] = c.suit
      sum += c.number
    }
    you.pairs = sum === you.selected ? pairs : []
    return self
  }

  private updateCards_(self: AirPokerData) {
    let disaster = false
    for (const p of self.players) {
      if (p.pairs === null) continue
      for (const c of p.pairs) {
        const index = self.cards[c.number].indexOf(c.suit)
        if (index < 0) disaster = true
        else self.cards[c.number].splice(index, 1)
      }
    }
    return disaster
  }

  /**
   *   Compares their Poker rank.
   *   If both of ranks are the same, compare a highest number of the hand.
   *   Ace(1) is highest. Two(2) is lowest.
   **/
  private judge_(a: Player, b: Player, aIsFirst: boolean) {
    if (a.bet === Bet.FOLD) return b
    else if (b.bet === Bet.FOLD) return a
    const ar = this.getRank(a.pairs as Card[])
    const br = this.getRank(b.pairs as Card[])
    // 勝敗判定 (独自：後攻有利なのでdrawなら先攻勝利)
    if (ar.rank > br.rank || (ar.rank === br.rank && ar.point > br.point) ||
      (ar.rank === br.rank && ar.point === br.point && aIsFirst)) return a
    return b
  }

  private nextRound_(self: AirPokerData) {
    const [a, b] = self.players
    const winner = this.judge_(a, b, a.id === self.firstBet)
    const disaster = this.updateCards_(self)
    if (disaster) {
      if (a === winner) b.air -= b.betAir
      else a.air -= a.betAir
    }
    winner.air += a.betAir + b.betAir
    // logging & minus round air & cleanup
    self.firstBet = self.firstBet === a.id ? b.id : a.id
    for (const p of self.players) {
      p.logs.push({
        selected: p.selected,
        pairs: p.pairs === null ? [] : p.pairs,
        bet: p.bet,
        betAir: p.betAir,

        air: p.air,
        win: (winner as You).id === p.id,
        disaster,
      })
      p.air -= 1
      p.bet = Bet.NONE
      p.betAir = 0
      p.selected = 0
      p.pairs = null
    }
    return self
  }

  getRank(cards: Card[]) {
    if (cards.length === 0) return {rank: RANK.HighCard, point: 0}
    const numbers = []
    let preSuit = null
    let flush = false
    for (const card of cards) {
      numbers.push(card.number)
      if (!preSuit) preSuit = card.suit
      else flush = preSuit === card.suit
    }
    let {point, rank} = this.rankWithoutFlush_(numbers)
    if (flush) rank = this.flush_(rank)
    return {point, rank}
  }

  /*
   * getCombinations_
   *   Returns sorted array of five numbers to be the arguement number by summing them.
   */
  private getCombinations_(cards: AirPokerBase['cards'], sum: number) {
    if (sum < 6 || sum >= sumMax) return []
    const combinations = []
    for (let a = 1; a < sum / 5; a++) {
      if (cards[a].length < 1) continue
      const max2 = sum - a
      for (let b = a;b <= Math.min(max2/4, 13); b++) {
        if (cards[b].length < (a === b ? 2 : 1)) continue
        const max3 = max2 - b;
        for (let c = b; c <= Math.min(max3 / 3, 13); c++) {
          if (cards[c].length < (a === c ? 3 : (b === c ? 2 : 1))) continue
          const max4 = max3 - c;
          for (let d = c; d <= Math.min(max4 / 2, 13); d++) {
            if (cards[d].length < (a === d ? 4 : (b === d ? 3 : (c === d ? 2 : 1)))) continue
            const e = max4 - d // eはd以上
            if (e > 13 || a === e ||
              cards[e].length < (b === e ? 4 : (c === e ? 3 : (d === e ? 2 : 1)))) continue
            combinations.push([a, b, c, d, e])
          }
        }
      }
    }
    return combinations;
  }

  /*
   * @param numbers length = 5
   * @return {rank: poker rank, point: high card number}
   */
  private rankWithoutFlush_(numbers: number[]) {
    if (numbers.length !== 5) throw new FieldError('invalid_data')
    const rank = {point: 0, rank: RANK.HighCard}

    const pairs: Record<number, number> = {}
    let count = 1
    const cards = numbers.map((v, i) => {
      if (v === 1) v = 14
      if (pairs[v]) {
        pairs[v] += 1
        count = count > pairs[v] ? count : pairs[v]
      } else pairs[v] = 1
      return v
    })
    cards.sort(asc)
    if (count === 1) {
      if (cards.every((e, i) => i + 1 === cards.length || e + 1 === cards[i + 1] || (e === 5 && cards[i + 1] === 14))) {
        if (cards[0] === 10) rank.rank = RANK.RoyalStraight
        else rank.rank = RANK.Straight
      }
      let point = ''
      for (const n of cards) point = n.toString(16) + point
      rank.point = parseInt(point, 16)
      return rank
    } else if (count === 2) {
      if (Object.keys(pairs).length === 3) { // 2 - 2 - 1
        rank.rank = RANK.TwoPair
        const a = cards[0] === cards[1] ? (cards[2] === cards[3] ? cards[4] : cards[2]) : cards[0]
        rank.point = parseInt(cards[3].toString(16) + cards[1].toString(16) + a.toString(16), 16)
      } else { // 2-1-1-1
        rank.rank = RANK.OnePair
        let point = ''
        let pairHex = ''
        for (const n of cards) {
          if (pairs[n] === 2) pairHex = n.toString(16)
          else point = n.toString(16) + point
        }
        rank.point = parseInt(pairHex + point, 16)
      }
    } else if (count === 3) {
      if (Object.keys(pairs).length === 2) { // 3 - 2
        rank.rank = RANK.FullHouse
        rank.point = parseInt(cards[2].toString(16) + (cards[0] === cards[2] ? cards[4].toString(16) : cards[0].toString(16)), 16)
      } else { // 3 - 1 - 1
        rank.rank = RANK.ThreeOfAKind
        const a = []
        for (const c of cards) if (c !== cards[2]) a.push(c)
        rank.point = parseInt(cards[2].toString(16) + a[1].toString(16) + a[0].toString(16), 16)
      }
    } else if (count === 4) { // 4 - 1
      rank.rank = RANK.FourOfAKind
      rank.point = parseInt(cards[1].toString(16) + (cards[0] === cards[1] ? cards[4].toString(16) : cards[0].toString(16)), 16)
    }
    return rank;
  }

  /*
   *   Finds an available suit.(if deckNum is 1)
   */
  private getFlushSuit_(cards: AirPokerBase['cards'], numbers: number[]): SUITS | null {
    if (numbers.length !== 5) throw new FieldError('invalid_data')
    let suits: SUITS[] = cards[numbers[0]]
    for (const n of numbers.slice(1)) {
      const oks = []
      for (const s of cards[n]) if (suits.includes(s)) oks.push(s)
      if (oks.length === 0) return null
      suits = oks
    }
    return suits[0]
  }

  flush_(rank: RANK): RANK {
    if (rank === RANK.Straight) return RANK.StraightFlush
    else if (rank === RANK.HighCard) return RANK.Flush
    else if (rank === RANK.RoyalStraight) return RANK.RoyalStraightFlush
    return rank
  }

  /*
   * 可能な役のペアを強い順で最大N個返す(最強と最弱は含める)
   */
  getCandidates(c: AirPokerBase['cards'], sum: number): {cards: Card[], rank: RANK}[] {
    const candidates = []
    for (const v of this.getCombinations_(c, sum)) {
      let {rank, point} = this.rankWithoutFlush_(v)
      let suit = null
      if (rank !== this.flush_(rank)) suit = this.getFlushSuit_(c, v)
      if (suit) rank = this.flush_(rank)

      const c2 = JSON.parse(JSON.stringify(c))
      candidates.push({rank, cards: v.map(number => ({number, suit: suit || c2[number].shift()}))})
    }
    candidates.sort((a, b) => b.rank - a.rank)
    return candidates
  }
}
