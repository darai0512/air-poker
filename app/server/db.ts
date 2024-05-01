'use server'
import AirPoker, {FieldError, Step, sumMax, msecLimit, Bet} from '~/src/AirPoker'
import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb'
import crypto from 'crypto'
import {PEER_ID_PATTERN} from "~/app/components/const"
import {setTimeout} from 'node:timers/promises'
import type {AirPokerStore, AirPokerResponse} from '~/src/index.d'
import type {Player, You} from "~/src/index.d";

const uri = process.env.MONGO_URI || 'mongodb://root:root@localhost:27778/?directConnection=true'
const DB = process.env.MONGO_DB || 'test'
const airPoker = new AirPoker()
const peerIdReg = new RegExp(PEER_ID_PATTERN)
const DuplicateKeyErrorCode = 11000 // E11000 duplicate key error collection: test.matching index: _id_ dup key
const logging = console

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})
async function run() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect()
  logging.log("connected to MongoDB!")
}
run().catch(logging.error)

function resp(self: AirPokerStore, id: string): AirPokerResponse {
  const [a, b] = self.players
  let you, opponent
  if (a.id === id) {
    you = a
    opponent = b
  } else if (b.id === id) {
    you = b
    opponent = a
  } else throw new FieldError('invalid_data')
  return {
    cards: self.cards,
    isFirst: self.firstBet === id,
    isBet: self.betPlayer === id,
    betCandidates: self.betPlayer === '' ? [] : airPoker.betCandidates(you, opponent, self.betPlayer === id),
    deadline: self.deadline,
    betLine: self.betLine,
    you,
    opponent: {
      air: opponent.air,
      betAir: opponent.betAir,
      bet: opponent.bet,
      selected: you.selected && you.pairs ? opponent.selected : (opponent.selected ? sumMax : 0),
      pairs: airPoker.getStep(self.players as [You, Player]) === Step.bet && opponent.pairs ? [] : opponent.pairs,
      logs: opponent.logs,
    }
  }
}

export async function waitCount() {
  try {
    const c = client.db(DB).collection('matching')
    return {success: true, count: await c.estimatedDocumentCount()}
  } catch(e: any) {
    return {success: false, error: e.code}
  }
}

export async function matching(params: {id: unknown}) {
  try {
    const c = client.db(DB).collection('matching')
    const r = await c.findOneAndDelete({})
    if (r) return {success: true, id: r._id}
    if (!peerIdReg.test(params.id as string)) return {success: false, error: 'peer_id_title'}
    await c.insertOne({_id: params.id as ObjectId})
    return {success: true, id: null}
  } catch(e: any) {
    console.error(e, params)
    if (e.code === DuplicateKeyErrorCode) return {success: false, error: 'peer_id_registered'}
    return {success: false, error: e.code || 'error'}
  }
}

export async function firstInit(params: {key: any}) {
  try {
    const id = crypto.randomUUID()
    const data = airPoker.firstInit({id})
    const deadline = new Date().getTime() + msecLimit.select
    const store: AirPokerStore = {...data,
      deadline,
      betLine: deadline + msecLimit.bet,
      lock: null,
    }
    await client.db(DB).collection('data').insertOne({...store, _id: params.key})
    return {success: true, data: resp(store, id)}
  } catch(e: any) {
    console.error(e, params)
    if (e.code === DuplicateKeyErrorCode) return {success: false, error: 'invalid_data'}
    return {success: false, error: e.code || 'error'}
  }
}

async function getData(_id: any, retry = 0): Promise<AirPokerStore> {
  const c = client.db(DB).collection('data')
  try {
    const data: unknown = await c.findOneAndUpdate({_id, lock: null}, {
      $set: {lock: new ObjectId()}
    })
    if (data === null) throw new FieldError('invalid_key')
    return data as AirPokerStore
  } catch (e: any) {
    if (e.code !== 'invalid_key' || retry > 3) throw new FieldError('invalid_key')
    await setTimeout(1000)
    return getData(_id, retry + 1)
  }
}

export async function secondInit(params: {key: any}) {
  const c = client.db(DB).collection('data')
  try {
    const data = await getData(params.key)
    const id = crypto.randomUUID()
    const newData = airPoker.secondInit(data, {id})
    await c.updateOne({_id: params.key}, {
      $set: {...newData, lock: null}}, {upsert: false})
    return {success: true, data: resp(newData as AirPokerStore, id)}
  } catch(e: any) {
    console.error(e, params)
    if (e.code !== 'invalid_key') c.updateOne({_id: params.key}, {
      $set: {lock: null}}, {upsert: false})
    return {success: false, error: e.code || 'error'}
  }
}

export async function next(params: {key: any, id: string, [key: string]: any}) {
  const c = client.db(DB).collection('data')
  try {
    const data = await getData(params.key)
    const now = Date.now()
    const step = airPoker.getStep(data.players as any)
    console.log('next', params, data.betPlayer, data.players.map(v=>v.pairs))

    const betLineOver = data.betLine - now < msecLimit.buffer
    const betPlayer = data.betPlayer
    let r: any = {data, step: null}
    if (params.timeout && data.deadline - now < msecLimit.buffer) {
      for (const p of data.players) {
        console.log('deadline', step)
        const ps: any = {id: p.id}
        if (step === Step.select && p.selected === 0) ps.cardIdx = p.hand.findIndex(v => v !== 0)
        else if (step === Step.bet && p.pairs === null) ps.pairs = []
        if (Object.keys(ps).length > 1) {console.log('deadline2'); r = airPoker.next(r.data, ps)}
      }
    }
    if (params.timeout && betPlayer && betLineOver) {
      console.log('betLine', step, betPlayer, betLineOver)
      r = airPoker.next(r.data, {bet: Bet.FOLD, id: betPlayer})
    }
    if (!params.timeout) r = airPoker.next(data, params)
    const newData: AirPokerStore = {...data, ...r.data, lock: null}
    if (r.step) {
      newData.deadline = r.step === Step.select ? Date.now() + msecLimit.pairs :
        (r.step === Step.judge ? Date.now() + msecLimit.select : newData.deadline)
      newData.betLine = Date.now() + msecLimit.bet
    }
    await c.updateOne({_id: params.key}, {$set: newData}, {upsert: false})
    return {success: true, data: resp(newData, params.id)}
  } catch(e: any) {
    console.error(e, params)
    if (e.code !== 'invalid_key') c.updateOne({_id: params.key}, {
      $set: {lock: null}}, {upsert: false})
    return {success: false, error: e.code || 'error'}
  }
}

/* todo
if (step === null) {
  await c.updateOne({_id: params.key},
    {$set: {'players.$[element]': data.players.find(v=>v.id===params.id)}, lock: null},
    {upsert: false, arrayFilters: [{'element.id': params.id}]})
 */
