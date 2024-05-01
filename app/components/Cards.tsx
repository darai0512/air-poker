'use client'
import {useState, memo, useRef} from "react";
import {useIntl} from "react-intl";
import {NUMBERS, SUITS} from "~/src/AirPoker";
import {
  buttonClass,
  cardMark,
  suitMap,
  toolTipTheme,
  trumpClass,
  trumpMiniClass,
  trumpSizeClass
} from "~/app/components/const"
import Modal from "~/app/components/modal";
import Timer from "~/app/components/Timer";
import Loading from "~/app/components/Loading";
import {Tooltip} from "flowbite-react"
import type {AirPokerResponse, Card} from "~/src";

export const Trump = memo(function Trump({
  suit, selected = -1, onClick, c, mini = false}: {suit: SUITS, c: number, selected?: number, onClick?:any, mini?: boolean}) {
  const {className, symbol} = suitMap[suit]
  return (
    <div className={trumpClass + (mini ? trumpMiniClass : trumpSizeClass) + (selected > -1 ? ' bg-indigo-400 ' : ' bg-white ') + className}
         onClick={onClick}
    >
      <span className={"self-start " + (mini ? "text-[10px]" : "text-xs sm:text-sm")}>{symbol}</span>
      <span className={"self-end " + (mini ? "text-[10px]" : "pr-1 text-sm sm:text-base")}>{cardMark[c] ? cardMark[c] : c}</span>
    </div>
  )
})

export const Trumps = memo(function Trumps({pairs}: {pairs: Card[]}) {
  const {formatMessage} = useIntl()
  if (pairs.length === 0) return formatMessage({id: 'no_rank'})
  return pairs.map((v, idx) => (
    <Trump key={`logs-pairs-${idx}`} c={v.number} suit={v.suit} mini/>
  ))
})

export function Cards({
  data, onSubmit}: {data: AirPokerResponse, onSubmit?:any}) {
  const [isOpen, setIsOpen] = useState(false)
  const [pairs, setPairs] = useState<Card[]>([])
  const pairsRef = useRef(pairs)
  const {formatMessage} = useIntl()
  if (Array.isArray(data.you.pairs)) {
    return (
      <div className={`flex items-center justify-center`}>
        <Tooltip content={<div className="flex"><Trumps pairs={pairsRef.current}/></div>}
                 trigger="click" theme={toolTipTheme}>
          <Loading id="waiting" ref={(node)=>{node && (node as HTMLSpanElement).click()}} />
        </Tooltip>
      </div>
    )
  }
  const cardElms = []
  const timer = data.you.selected && data.opponent.selected ?
    (<Timer deadline={data.deadline} handler={onSubmit}/>) : null
  const id = timer ? 'make_rank' : 'remaining'
  for (const c of NUMBERS) {
    for (const [suit, _] of Object.entries(SUITS)) {
      if (!data.cards[c].includes(suit as SUITS)) {
        cardElms.push(<div key={`card-${c}-${suit}`} className={trumpSizeClass}></div>)
        continue
      }
      let selected = -1
      let onClick
      if (timer) {
        selected = pairs.findIndex(v => v.number === c && v.suit === suit)
        onClick = (e: any) => {
          if (selected > -1) setPairs(pairs.filter((_, i) => i !== selected))
          // @ts-ignore
          else if (pairs.length < 5) setPairs([...pairs, {number: c, suit}])
        }
      }
      cardElms.push(
        <Trump key={`t-${c}-${suit}`} onClick={onClick} selected={selected} c={c} suit={suit as SUITS} />
      )
    }
  }
  const onClose = () => setIsOpen(false)
  return (<div>
    <button className={'h-[50px] ' + buttonClass} onClick={()=>setIsOpen(true)}>
      {timer || 'Cards'}
    </button>
    <Modal isOpen={isOpen} onClose={onClose} opacity="bg-opacity-80"
           title={formatMessage({id}, {sum: data.you.selected})}>
      <div className="grid grid-rows-4 grid-flow-col sm:gap-1">
        {cardElms}
      </div>
      <div className="flex my-2 justify-center">
        {timer && (
          <button
            type="button"
            className={buttonClass + ' mx-2'}
            onClick={()=>{
              onClose()
              onSubmit({pairs})
              pairsRef.current = pairs
              setPairs([])
            }}
            disabled={pairs.length !== 5}
          >
            {formatMessage({id: 'make_button_value'})}
          </button>
        )}
        <button
          type="button"
          className="mx-2 rounded-md border bg-blue-100 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
          onClick={onClose}
        >
          close
        </button>
      </div>
    </Modal>
  </div>)
}