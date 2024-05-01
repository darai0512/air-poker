'use client'
import AirPoker, {Bet, Step} from '~/src/AirPoker'
import {firstInit, next, secondInit} from '~/app/server/db'
import React, {memo, ReactNode, useRef, useState} from "react"
import {Lobby} from "./components/lobby"
import Loading from "./components/Loading"
import Modal from "./components/modal"
import {useIntl} from "react-intl"
import Bubbles from "~/app/components/Bubble"
import {HandCard, HandTooltip, OpCard, StaticCard} from "~/app/components/Hand"
import {Cards, Trumps} from "~/app/components/Cards"
import {Label, RangeSlider, Tooltip} from "flowbite-react"
import {buttonClass, handEmptyClass, toolTipBottomTheme} from "~/app/components/const"
import Timer from '~/app/components/Timer'
import Image from "next/image";
import {Transition} from "@headlessui/react";
import {ArrowDownTrayIcon, FireIcon} from "@heroicons/react/16/solid"
import type {AirPokerResponse, Log, Player} from '~/src'
import type {DataConnection, Peer} from "peerjs"

const airPoker = new AirPoker()
const infoClassName = "flex flex-wrap font-mono text-sm text-[color:black] bg-transparent sm:p-3 p-1 border-neutral-800 rounded-xl border"

function Player_({player, name, step, timer, win}:
  {player: Player, name: string, step: Step, timer?: ReactNode, win?: boolean}) {
  const {formatMessage} = useIntl()
  let elm
  const prev = player.logs.at(-1) || {} as Log
  if (timer) elm = (<div className="flex">{timer}</div>)
  else if (step === Step.bet) {
    elm = (
      <div>{player.bet ? player.bet : formatMessage({id: 'entry'})}: {player.betAir}air</div>
    )
  } else if (step === Step.end) {
    elm = (
      <div className="font-bold text-[color:red]">{win ? 'Win & Survived!' : 'Lose & Drowned...'}</div>
    )
  }
  return (
    <div className="grid grid-rows-3 grid-flow-col gap-2 mx-auto"
         ref={node=>{node && player.logs.length > 0 &&
         step !== Step.bet && (node as HTMLSpanElement).click()}}>
      <div className="flex">{name}</div>
      <div className="flex">
        <Image src="/images/logo.png"
               alt="logo"
               width={18}
               height={18}
               priority
               style={{
                 width: '18px',
                 height: '18px',
               }}
        />&nbsp;{player.air}air{prev.win ? (<span className="crown ml-1"></span>) : (
          prev.disaster ? (<FireIcon className="flex-none h-4"/>) : null)}
      </div>
      {elm}
    </div>
  )
}

function Player({player, name, step, timer, win}:
  {player: Player, name: string, step: Step, timer?: ReactNode, win?: boolean}) {
  if (player.logs.length === 0) return (
    <div className={'col-span-2 row-span-2 ' + infoClassName}>
      <Player_ player={player} name={name} step={step} timer={timer} win={win}/>
    </div>
  )
  return (
    <div className={'col-span-2 row-span-2 ' + infoClassName}>
      <Tooltip content={LogsElm(player.logs)} trigger="click" placement="bottom"
               theme={toolTipBottomTheme}
      >
        <Player_ player={player} name={name} step={step} timer={timer} win={win}/>
      </Tooltip>
    </div>
  )
}

const LogsElm = (logs: Log[]) => {
  if (logs.length === 0) return null
  return (<>
    {logs.map((v, i) => (<div key={`logs-${i}`} className="flex">
      R{i+1}:&nbsp;{v.selected}→<Trumps pairs={v.pairs}/>&nbsp;{v.win ? 'Win' : 'Lose'}
      {!v.win && v.disaster && <FireIcon className="flex-none h-4"/>}&nbsp;{v.air}air
    </div>
    ))}
  </>)
}

function EndInfo({data, names, onSubmit}:{data: AirPokerResponse, names: any, onSubmit: any}) {
  const youWin = data.opponent.air < data.you.air
  return (
    <div className="grid grid-flow-col-dense grid-cols-5 grid-rows-2 gap-1 sm:gap-2 mb-2">
      <Player player={data.opponent} name={names.opponent} step={Step.end} win={!youWin}/>
      <div className="mx-auto my-auto">
        <button className={buttonClass} onClick={onSubmit}>End</button>
      </div>
      <div>
        <Cards data={data}/>
      </div>
      <Player player={data.you} name={names.you} step={Step.end} win={youWin}/>
    </div>
  )
}

const Round = memo(function Info({round}: {round: number}) {
  return (
    <div className="mx-auto my-auto">
      <div className={infoClassName}>Round&nbsp;{round}</div>
    </div>
  )
})

const Info = memo(function Info({data, names, onSubmit}:
                                  {data: AirPokerResponse, names: any, onSubmit: any}) {
  const step = airPoker.getStep([data.you, data.opponent])
  const youTimer = (data.betCandidates.length > 0 && data.isBet) ? (<>
      Bet by&nbsp;<Timer deadline={data.betLine} handler={onSubmit}/>
    </>) : (step === Step.select && data.you.selected === 0) ? (<>
      Select by&nbsp;<Timer deadline={data.deadline} handler={onSubmit}/>
    </>) : null
  const opTimer = (data.betCandidates.length > 0 && !data.isBet) ? (<>
      Bet by&nbsp;<Timer deadline={data.betLine} handler={onSubmit}/>
    </>) : (step === Step.select && data.opponent.selected === 0) ? (<>
      Select by&nbsp;<Timer deadline={data.deadline} handler={onSubmit}/>
    </>) : (step === Step.bet && data.betCandidates.length === 0 && data.opponent.pairs === null) ?
      (<>Make by&nbsp;<Timer deadline={data.deadline} handler={onSubmit}/>
    </>) : null
  return (
    <div className="grid grid-flow-col-dense grid-cols-5 grid-rows-2 gap-1 sm:gap-2 mb-2">
      <Player player={data.opponent} name={names.opponent} step={step} timer={opTimer}/>
      <Round round={airPoker.getRound(data.you)}/>
      <Cards data={data} onSubmit={onSubmit} />
      <Player player={data.you} name={names.you} step={step} timer={youTimer}/>
    </div>
  )
})

function Error({message, onClose}: {message: string, onClose: () => void}) {
  return (
  <Modal isOpen={message !== ''} onClose={onClose} title={message}>
    <div className="flex mt-4 justify-center">
      <button
        type="button"
        className="rounded-md border bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
        onClick={onClose}
      >
        ok
      </button>
    </div>
  </Modal>
  )
}

const Raise = memo(function Raise({max, handler}: {max: number, handler: any}) {
  const [tip, setTip] = useState(1)
  return (<div className="flex max-w-md flex-col sm:gap-2">
    <Label htmlFor="tip" value={`Raise +${tip} air`} />
    <div className="mx-auto">
      <button className={buttonClass} onClick={()=>handler({bet: Bet.RAISE, tip})}>RAISE</button>
    </div>
    <div className="relative">
      <RangeSlider id="tip" value={tip} min={1} max={max} step={1}
                   onChange={(e)=>setTip(parseInt(e.target.value, 10))}
                   disabled={max === 1} />
      <span className="text-sm absolute start-0 -bottom-6">1 air</span>
      <span className="text-sm absolute end-0 -bottom-6">{max} air</span>
    </div>
  </div>)
})

export default function Main() {
  const [data, _setData] = useState(airPoker.data as AirPokerResponse)
  const [error, setError] = useState('')
  const [peer, setPeer] = useState({} as Peer)
  const {formatMessage} = useIntl()
  const lobbyRef = useRef({you: '', opponent: '', conn: {} as DataConnection})
  const dataRef = useRef(data)
  const setData = (newData: (typeof data)) => {
    dataRef.current = newData
    _setData(newData)
  }

  const onSubmit = async (params: any) => {
    const you = dataRef.current.you
    const conn: DataConnection = lobbyRef.current.conn // Object.values(peer.connections)[0][0].label
    const key = conn.label
    if (!key) return setError(formatMessage({id: 'invalid_connection'}))
    let r
    if (!you) {
      if (params && params.hello) r = await firstInit({key})
      else r = await secondInit({key})
    } else r = await next({...params, key, id: you.id})
    if (r.success && r.data) {
      setData(r.data)
      if (params !== null) conn.send({action: 'ping'})
    } else setError(formatMessage({id: r.error}))
  }

  let elms
  if (!data.you) {
    elms = (
      <Lobby setError={setError}
             peer={peer}
             setPeer={setPeer}
             onSubmit={onSubmit}
             lobbyRef={lobbyRef}
      ></Lobby>)
  } else {
    const step = airPoker.getStep([data.you, data.opponent])
    if (step === Step.end) {
      document.body.classList.add('before:animate-[smooth_5s_linear_1_normal_forwards]')
      const onClick= () => {
        if (typeof peer.destroy === 'function') peer.destroy()
        return window.location.reload()
      }
      return (<>
        <EndInfo data={data} names={lobbyRef.current} onSubmit={onClick}/>
      </>)
    }
    const betButtons = {} as Record<keyof typeof Bet, ReactNode>
    if (step === Step.bet) {
      for (const bet of Object.keys(Bet) as (keyof typeof Bet)[]) {
        if (!Bet[bet]) continue
        if (data.betCandidates.length === 0) continue
        else if (!data.isBet) {
          betButtons[bet] = (<Loading id="betting"/>)
          continue
        }
        betButtons[bet] = data.betCandidates.includes(Bet[bet]) ? (bet === Bet.RAISE ? (
            <Raise max={airPoker.getMaxRaise(data.you, data.opponent)} handler={onSubmit} />
          ) : (
            <button className={buttonClass} onClick={() => onSubmit({bet})}>{bet}</button>
          )) : (
            <button className={buttonClass} disabled>{bet}</button>
          )
      }
    }
    elms = (<>
      <Info data={data} names={lobbyRef.current} onSubmit={onSubmit} />
      <div className="grid grid-cols-5 grid-flow-row gap-2">
        <div className="col-start-1 col-span-2 flex justify-center items-center">{betButtons.CHECK}</div>
        <div className="col-start-3 col-span-1">
        {step === Step.bet && data.you.pairs !== null ? (
          <Transition show appear enterFrom="back-above reverse-x">
            <HandCard card={data.opponent.selected} candidates={airPoker.getCandidates(data.cards, data.opponent.selected)} />
          </Transition>
        ) : (<><OpCard waiting={data.opponent.selected === 0}/></>)}
        </div>
        <div className="col-span-2 flex justify-center items-center">{betButtons.RAISE}</div>
        <div className="col-start-1 col-span-2 flex justify-center items-center">{betButtons.CALL}</div>
        <div className="col-start-3 col-span-1">
        {step === Step.bet && data.opponent.pairs !== null ? (
          <Transition show appear enterFrom="back-above">
            <HandCard card={data.you.selected} candidates={airPoker.getCandidates(data.cards, data.you.selected)} />
          </Transition>
        ) : data.you.selected > 0 ? (
          <div className="back-above front-by-hover">
          <HandCard card={data.you.selected} candidates={airPoker.getCandidates(data.cards, data.you.selected)} />
          </div>
        ) : (
          <div className={handEmptyClass + " flex"}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault()
                 onSubmit({cardIdx: parseInt(e.dataTransfer.getData('cardIdx'), 10)})
               }}
          >
            <div className="flex justify-center items-center"><ArrowDownTrayIcon  className="h-8"/>
            Drag & Drop</div>
          </div>
        )}
        </div>
        <div className="col-span-2 flex justify-center items-center">{betButtons.FOLD}</div>
      {data.you.hand.map((v, i) => data.you.selected === 0 && v !== 0 ? (
        <HandTooltip key={`hand-${i}`} candidates={airPoker.getCandidates(data.cards, v)}>
          <div className="cursor-grab"
               draggable
               onDragStart={(e) => {
                 e.dataTransfer.setData('cardIdx', String(i));
                 (e.target as HTMLElement).classList.add('cursor-grabbing');
               }}
               onDragEnd={(e: any) => e.target.classList.remove('cursor-grabbing')}
          >
            <StaticCard card={v} />
          </div>
        </HandTooltip>
      ) : (
        <HandCard key={`hand-static-${i}`} card={v} candidates={airPoker.getCandidates(data.cards, v)} />
      ))}
      </div>
    </>)
  }
  return (<>
    {elms}
    {error !== '' ? <Error message={error} onClose={()=>setError('')}/> : null}
    <Bubbles/>
  </>)
}