'use client'
import React, {memo} from 'react'

const initNum = 20
const shakeKind = 10

// todo move, position, scale
// const bubbleMap = [{m: 4, p: 8, s: 9},] => i,j消す

const Bubble = memo(function Bubble({i}: {i: number}) {
  let j
  switch (i % 5) {
    case 0:
      j = (i + 5) % shakeKind
    case 1:
      j = (i + 15) % shakeKind
    case 2:
      j = (i + 10) % shakeKind
    case 3:
      j = (i + 20) % shakeKind
    default: // = 4
      j = i % shakeKind
  }
  return (
      <div className={`bubble move${(i*j) % initNum} pos${j}`}>
        <div className={`scale${(i*j+5) % shakeKind}`}>
          <div className={`item shake${j % shakeKind}`} />
        </div>
      </div>
  )
})

export default function Bubbles({num = initNum}: {num?: number}) { // todo num not working
  const nodes = []
  for (let i=0;i < num;i++) nodes.push(<Bubble i={i} key={`bb-${i}`} />)
  return nodes
}