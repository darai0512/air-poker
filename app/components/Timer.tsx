'use client'
import React, {useState, useEffect} from "react";
import {ClockIcon} from "@heroicons/react/16/solid"

const interval = 1 * 1000
const redLine = 10

function useTimer(deadlineTs: number) {
  const [ts, setTs] = useState(deadlineTs - Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => {
      // setTs((_timespan) => _timespan - interval)
      setTs(new Date(deadlineTs).getTime() - Date.now())
    }, interval)
    return () => {
      clearInterval(intervalId);
    }
  }, [deadlineTs])
  const sec = Math.floor(ts / 1000)
  return sec < 0 ? 0 : sec
}

export default function Timer({deadline, handler}:
  {deadline: number, handler?: (params: any) => void}) {
  const ts = useTimer(deadline)
  useEffect(() => {
    if (ts === 0 && handler) handler({timeout: true}) // deadline = 0があり得る場合は注意
  }, [ts])
  return (
    <div className={'flex' + (ts < redLine ? ' text-red-500' : '')}>
      <ClockIcon className="flex-none h-4 mt-[2px]"/>
      <span suppressHydrationWarning>{ts}</span>
    </div>
  )
}