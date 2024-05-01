// @ts-nocheck
import AirPoker, {Bet, RANK, SUITS, sumMax} from './AirPoker';
import {expect, test, vi} from "vitest";

test("new", () => {
  const a = new AirPoker()
  const data = a.data
  expect(data.cards[1]).toEqual(["HEART", "DIAMOND", "SPADE", "CLUB"])
})
test("initHands_", () => {
  const a = new AirPoker()
  const r = a.initHands_()
  expect(r[0].length).toEqual(5)
  expect(r[1].length).toEqual(5)
  for (const b of r[0]) {
    expect(b !== null).toBe(true)
    expect(b).toBeGreaterThanOrEqual(6)
    expect(b).toBeLessThanOrEqual(64)
  }
  for (const b of r[1]) {
    expect(b !== null).toBe(true)
    expect(b).toBeGreaterThanOrEqual(6)
    expect(b).toBeLessThanOrEqual(64)
  }
})

const player = {id: 'id'}
const player2 =  {id: 'id2'}

test("init", () => {
  const a = new AirPoker()
  const data = a.firstInit(player)
  expect(data.players[0].id).toEqual('id')
  expect(data.players[0].hand.length).toEqual(5)
  for (const c of data.players[0].hand) {
    expect(c).toBeGreaterThanOrEqual(6)
    expect(c).toBeLessThanOrEqual(64)
  }
  expect(data.players[0].air).toEqual(24)
  expect(data.players[0].betAir).toEqual(0)
  expect(data.players[0].bet).toEqual(Bet.NONE)

  expect(() => a.firstInit({
    id: '',
  })).toThrowError(/invalid_data/)
})

test("getRound should return the number of round", () => {
  const a = new AirPoker()
  let data = a.firstInit(player)
  expect(a.getRound(data.players[0])).toEqual(1)
})

test("getMaxRaise should return the number of half of total bet", () => {
  const a = new AirPoker()
  let data = a.firstInit(player)
  data = a.secondInit(data, player2)
  expect(a.getMaxRaise(...data.players)).toEqual(0)
})

test("betCandidates", () => {
  const a = new AirPoker()
  let data = a.firstInit(player)
  data = a.secondInit(data, player2)
  data.players[0].betAir = 3
  data.players[0].bet = Bet.RAISE
  data.players[1].betAir = 3
  data.players[1].bet = Bet.CALL
  expect(a.betCandidates(...data.players, true).length).toEqual(0)
})

test("bet_ CHECK -> CHECK", () => {
  const a = new AirPoker()
  const spy = vi.spyOn(a, 'initHands_')
  spy.mockImplementation(() => [[6,6,6,6,6], [7,7,7,7,7]])

  let data = a.firstInit(player)
  expect(data.players[0].id).toEqual(player.id)
  data = a.secondInit(data, player2)
  expect(data.players[1].id).toEqual(player2.id)
  data = a.setCard_(data, {cardIdx: 0, id: player.id})
  expect(data.players[0].selected).toEqual(6)
  data = a.setCard_(data, {cardIdx: 0, id: player2.id})
  expect(data.players[1].selected).toEqual(7)
  data = a.initBet_(data)
  expect(data.betPlayer).toEqual(data.players[0].id)
  expect(a.betCandidates(data.players[0], data.players[1], true)).toEqual([Bet.CHECK, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], false)).toEqual([Bet.CHECK, Bet.RAISE])
  data = a.bet_(data, {bet: Bet.CHECK})
  expect(data.players[0].bet).toEqual(Bet.CHECK)
  expect(data.players[0].betAir).toEqual(1)
  expect(data.players[0].air).toEqual(23)
  expect(data.betPlayer).toEqual(player2.id)

  expect(a.betCandidates(data.players[0], data.players[1], false)).toEqual([Bet.CHECK, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], true)).toEqual([Bet.CHECK, Bet.RAISE])
  data = a.bet_(data, {bet: Bet.CHECK})
  expect(data.players[1].bet).toEqual(Bet.CHECK)

  expect(data.betPlayer).toEqual('')
  expect(a.betCandidates(data.players[0], data.players[1], true)).toEqual([])
  expect(a.betCandidates(data.players[1], data.players[0], false)).toEqual([])
})

test("bet_ CHECK -> RAISE -> CALL", () => {
  const a = new AirPoker()
  const spy = vi.spyOn(a, 'initHands_')
  spy.mockImplementation(() => [[6,6,6,6,6], [7,7,7,7,7]])

  let data = a.firstInit(player)
  data = a.secondInit(data, player2)
  data = a.setCard_(data, {cardIdx: 0, id: player.id})
  data = a.setCard_(data, {cardIdx: 0, id: player2.id})
  data = a.initBet_(data)
  data = a.bet_(data, {bet: Bet.CHECK})
  data = a.bet_(data, {bet: Bet.RAISE, tip: 1})
  expect(data.players[1].bet).toEqual(Bet.RAISE)
  expect(data.players[1].betAir).toEqual(2)
  expect(data.players[1].air).toEqual(22)
  expect(data.betPlayer).toEqual(player.id)
  expect(a.betCandidates(data.players[0], data.players[1], true)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], false)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])

  data = a.bet_(data, {bet: Bet.CALL})
  expect(data.players[0].bet).toEqual(Bet.CALL)
  expect(data.players[0].betAir).toEqual(2)
  expect(data.players[0].air).toEqual(22)

  expect(data.betPlayer).toEqual('')
  expect(a.betCandidates(data.players[0], data.players[1], false)).toEqual([])
  expect(a.betCandidates(data.players[1], data.players[0], true)).toEqual([])
})

test("bet_ RAISE -> RAISE -> RAISE -> FOLD", () => {
  const a = new AirPoker()
  const spy = vi.spyOn(a, 'initHands_')
  spy.mockImplementation(() => [[6,6,6,6,6], [7,7,7,7,7]])

  let data = a.firstInit(player)
  data = a.secondInit(data, player2)
  data = a.setCard_(data, {cardIdx: 0, id: player.id})
  data = a.setCard_(data, {cardIdx: 0, id: player2.id})
  data = a.initBet_(data)
  data = a.bet_(data, {bet: Bet.RAISE, tip: 1})
  expect(data.players[0].bet).toEqual(Bet.RAISE)
  expect(data.players[0].betAir).toEqual(2)
  expect(data.players[0].air).toEqual(22)
  expect(data.betPlayer).toEqual(player2.id)
  expect(a.betCandidates(data.players[0], data.players[1], false)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], true)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])

  data = a.bet_(data, {bet: Bet.RAISE, tip: 1})
  expect(data.players[1].bet).toEqual(Bet.RAISE)
  expect(data.players[1].betAir).toEqual(3)
  expect(data.players[1].air).toEqual(21)
  expect(data.betPlayer).toEqual(player.id)
  expect(a.betCandidates(data.players[0], data.players[1], true)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], false)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])

  data = a.bet_(data, {bet: Bet.RAISE, tip: 2})
  expect(data.players[0].bet).toEqual(Bet.RAISE)
  expect(data.players[0].betAir).toEqual(5)
  expect(data.players[0].air).toEqual(19)
  expect(data.betPlayer).toEqual(player2.id)
  expect(a.betCandidates(data.players[0], data.players[1], false)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])
  expect(a.betCandidates(data.players[1], data.players[0], true)).toEqual([Bet.FOLD, Bet.CALL, Bet.RAISE])

  data = a.bet_(data, {bet: Bet.FOLD})
  expect(data.players[1].bet).toEqual(Bet.FOLD)
  expect(data.players[1].betAir).toEqual(3)
  expect(data.players[1].air).toEqual(21)

  expect(data.betPlayer).toEqual('')
  expect(a.betCandidates(data.players[0], data.players[1], true)).toEqual([])
  expect(a.betCandidates(data.players[1], data.players[0], false)).toEqual([])
})

test("should return an available suit from remaining cards / null due to lack of available suits", () => {
  const a = new AirPoker()
  const testNumbers = [1, 2, 3, 4, 5]
  expect(a.getFlushSuit_(a.data.cards, testNumbers)).toEqual(SUITS.HEART)
  a.data.cards[5] = [];
  expect(a.getFlushSuit_(a.data.cards, testNumbers)).toBe(null)
})

test("should judge", () => {
  const a = new AirPoker()
  let data = a.firstInit(player)
  data = a.secondInit(data, player2)

  const [b, c] = data.players
  b.pairs = [
    {number: 1, suit: SUITS.HEART},
    {number: 1, suit: SUITS.DIAMOND},
    {number: 1, suit: SUITS.SPADE},
    {number: 1, suit: SUITS.CLUB},
    {number: 2, suit: SUITS.DIAMOND},
  ]
  c.pairs = JSON.parse(JSON.stringify(b.pairs))
  expect(a.judge_(b, c, true)).toEqual(b)
  c.pairs![4] = {number: 3, suit: SUITS.HEART}
  expect(a.judge_(b, c, true)).toEqual(c)
})

test.each([
  [[12, 12, 12, 12, 1], {point: 0xce, rank: RANK.FourOfAKind}],
  [[2, 2, 2, 3, 3], {point: 0x23, rank: RANK.FullHouse}],
  [[10, 11, 12, 13, 1], {point: 0xedcba, rank: RANK.RoyalStraight}],
  [[1, 2, 3, 4, 5], {point: 0xe5432, rank: RANK.Straight}],
  [[2, 3, 4, 5, 6], {point: 0x65432, rank: RANK.Straight}],
  [[2, 3, 3, 3, 4], {point: 0x342, rank: RANK.ThreeOfAKind}],
  [[2, 2, 2, 3, 4], {point: 0x243, rank: RANK.ThreeOfAKind}],
  [[2, 2, 3, 4, 4], {point: 0x423, rank: RANK.TwoPair}],
  [[2, 2, 3, 3, 4], {point: 0x324, rank: RANK.TwoPair}],
  [[5, 2, 3, 4, 4], {point: 0x4532, rank: RANK.OnePair}],
  [[5, 2, 2, 3, 4], {point: 0x2543, rank: RANK.OnePair}],
  [[1, 2, 3, 4, 6], {point: 0xe6432, rank: RANK.HighCard}],
  [[8, 10, 11, 12, 13], {point: 0xdcba8, rank: RANK.HighCard}],
])('rank of %s is %s', (cards, expected) => {
  const a = new AirPoker()
  expect(a.rankWithoutFlush_(cards)).toEqual(expected)
})

test.each([
  [6, [[1, 1, 1, 1, 2]]],
  [7, [[1, 1, 1, 1, 3], [1, 1, 1, 2, 2]]],
  [64, [[12, 13, 13, 13, 13]]],
])('sum=%s is %s', (sum, expected) => {
  const a = new AirPoker()
  expect(a.getCombinations_(a.data.cards, sum)).toEqual(expected)
})

test.each([
  [6, {
    [RANK.FourOfAKind]: [
      {number: 1, suit: SUITS.HEART},
      {number: 1, suit: SUITS.DIAMOND},
      {number: 1, suit: SUITS.SPADE},
      {number: 1, suit: SUITS.CLUB},
      {number: 2, suit: SUITS.HEART}
    ],
  }],
  [35, {
    [RANK.Straight]: [
      {number: 5, suit: SUITS.HEART},
      {number: 6, suit: SUITS.HEART},
      {number: 7, suit: SUITS.HEART},
      {number: 8, suit: SUITS.HEART},
      {number: 9, suit: SUITS.HEART}
    ],
  }],
])('sum=%s includes %s', (sum, expected: Record<RANK, Card[]>) => {
  const a = new AirPoker()
  for (const c of a.getCandidates(a.data.cards, sum)) {
    if (expected[c.rank]) expect(expected[c.rank]).toEqual(c.cards)
  }
})

test("getCandidates: no pairs", () => {
  const a = new AirPoker()
  expect(a.getCandidates(a.data.cards, 5).length).toBe(0)
  expect(a.getCandidates(a.data.cards, sumMax).length).toBe(0)
  const empty = {}
  for (let i=1;i<14;i++) {
    empty[i] = []
  }
  expect(a.getCandidates(empty, 6).length).toBe(0)
})
