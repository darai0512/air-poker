import React, {memo} from 'react'
import {RANK} from "~/src/AirPoker"
import { Tooltip } from 'flowbite-react'
import {toolTipTheme, handSizeClass, handClass, handEmptyClass} from '~/app/components/const'
import {useIntl} from "react-intl";
import {Trump} from "~/app/components/Cards";
import {Card} from '~/src/index'

export const OpCard = memo(function OpCard({waiting}: {waiting: boolean}) {
  return (
    <div className={'reverse-x back-above relative ' + handSizeClass}>
      <div className={"back rounded" + (waiting ? " animate-pulse" : "")}></div>
      {waiting &&
      <div className="px-3 py-1 absolute top-[40%] left-0 right-0 text-xs font-medium leading-none text-blue-800 bg-blue-200 rounded-full animate-pulse">
        Opponent Waiting...
      </div>
      }
    </div>
  )
})

export const HandTooltip = memo(function HandTooltip({
  candidates, children}: {candidates: any[], children: any}) {
  const {formatMessage} = useIntl()
  let elm
  if (candidates.length === 0) {
    elm = <div>{formatMessage({id: 'no_pairs'})}</div>
  } else {
    elm = (
      <div className="max-h-[225px] sm:max-h-[275px] overflow-y-auto scrollbar-none">
        {candidates.map((c, i) => (
          <div key={`t-c-${i}`} className="flex">
            {RANK[c.rank]}&nbsp;{c.cards.map((c: Card, i: number) => (
              <Trump key={`t-c-${i}-t-${i}`} suit={c.suit} c={c.number} mini={true}/>
            ))}
          </div>
        ))}
      </div>
    )
  }
  // todo arrow of bottom pattern
  return (
    <Tooltip content={elm} theme={toolTipTheme} trigger="click">
      {children}
    </Tooltip>
  );
})

export const StaticCard = memo(function HandCard({
  card}: {card: number}) {
  if (card === 0) return <div className={handEmptyClass}/>
  return (
    <div className={'relative ' + handSizeClass}>
      <div className="back rounded"></div>
      <div className={handClass}>{card}</div>
    </div>
  )
})
export const HandCard = memo(function HandCard({
  card, candidates}: {card: number, candidates: any[]}) {
  if (card === 0) return <div className={handEmptyClass}/>
  return (
    <HandTooltip candidates={candidates}>
      <div className={'relative cursor-pointer ' + handSizeClass}>
        <div className="back rounded"></div>
        <div className={handClass}>{card}</div>
      </div>
    </HandTooltip>
  );
})