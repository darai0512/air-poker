'use client'
import React, {useState, useEffect, ChangeEvent, MouseEventHandler} from 'react'
import {UsersIcon, CloudIcon, QuestionMarkCircleIcon} from "@heroicons/react/24/outline"
import {
  buttonClass,
  PEER_ID_LENGTH,
  PEER_ID_PATTERN,
  nameMaxLength,
  toolTipBottomTheme
} from "./const"
import {useIntl} from "react-intl"
import {Tooltip} from "flowbite-react"
import {matching} from '../server/db'
import Loading from './Loading'
import type {Peer, DataConnection, PeerError} from "peerjs"

export interface RTCData {
  action: 'ping' | 'hello'
  [key: string]: any
}

const inputClass = "block flex-1 border-0 border-white bg-transparent py-1.5 pl-1 " +
  "placeholder-gray-400 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"

function isRTCData(data: unknown): data is RTCData {
  return typeof data === 'object' && typeof (data as RTCData).action === 'string'
}

export function Lobby({setError, peer, setPeer, onSubmit, lobbyRef}: {setError: any, peer: any,
  setPeer: any, onSubmit: any, lobbyRef: {current: {you: string, opponent: string, conn: DataConnection}}}) {
  const [online, setOnline] = useState({
    name: '', fixed: false, friend: false,
  })
  const {formatMessage, locale} = useIntl()

  function sender(_peer: any, id: string) {
    const conn = _peer.connect(id, {metadata: online.name})
    conn.on('open', () => {
      _peer.disconnect()
      conn.on('data', (data: RTCData) => {
        console.log('conn.data', data, conn.label)
        if (!isRTCData(data)) return
        if (data.action === 'hello') {
          lobbyRef.current = {you: online.name, opponent: data.name, conn}
          return onSubmit({hello: true})
        } else return onSubmit(null)
      })
      conn.on('error', (err: { type: string }) => {
        console.error('conn.error', err)
        setError(formatMessage({id: err.type}))
      })
    })
    conn.on('close', () => {
      console.error('close', conn)
      setError(formatMessage({id: 'host_connection_close'}))
    })
  }
  function matched(res: {success: boolean, error?: string, id?: any}) {
    if (!res.success) return setError(formatMessage({id: res.error}))
    else if (res.id) sender(peer, res.id)
  }

  useEffect(() => { // 初回レンダリング後必ず呼ばれる
    if (!peer.id) return
    // 受け手の設定
    peer.on('connection', (conn: DataConnection) => {
      conn.on('open', () => {
        console.log('receiver conn.open', conn.label, conn, peer)
        peer.disconnect()
        conn.send({action: 'hello', name: online.name})
        lobbyRef.current = {you: online.name, opponent: conn.metadata, conn}
        conn.on('data', (data) => {
          console.log('receiver  conn.data', data, conn.label, conn, peer)
          if (isRTCData(data) && data.action === 'ping') return onSubmit(null)
        })
        conn.on('error', (err) => {
          console.error('conn.error', err, conn, peer)
          setError(formatMessage({id: err.type}))
        })
      })
      conn.on('close', () => { // hostがリロードした時
        setError(formatMessage({id: 'non_host_connection_close'}))
      })
    })
    if (!online.friend) matching({id: peer.id}).then(matched).catch((e) => window.location.reload())
    return () => {}
  }, [peer])

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checkValidity()) return e.target.reportValidity()
    sender(peer, e.target.value)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOnline({...online, friend: !online.friend})
    matching({id: peer.id}).then(matched).catch((e) => window.location.reload())
  }
  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const name = online.name
    if (name.length > nameMaxLength || name.length < 1) return setError(formatMessage({id: 'online_name'}))
    setOnline({...online, fixed: true})
    // @ts-ignore
    const _peer = new Peer()
    _peer.on('open', (id) => {
      setPeer(_peer)
    })
    _peer.on('error', (err: PeerError<any>) => {
      console.error('peer.error', err, _peer, err.type)
      setError(formatMessage({id: err.type}, {br: <br/>}))
      if (err.type === 'peer-unavailable') {
        matching({id: _peer.id}).then(matched).catch((e) => {console.error(e);window.location.reload()})
      }
    })
  }
  return (
    <>
      <h1 className={'relative -z-10 text-[32px]/[32px] sm:text-[46px]/[46px] ' +
        "font-['Zapfino']"}>
        Air Poker
      </h1>
      {online.fixed ? (!peer.id || !online.friend ? (<>
        <Loading id="waiting" h={20} />
        <div className="flex cursor-pointer underline"
             onClick={()=>document.getElementById('rule')?.click()}
        ><QuestionMarkCircleIcon className="flex-none h-5 mt-[1px] mr-1"/>Rule</div>
      </>) : (<>
        <h2 className="mb-2 text-gray-600">Your ID: {peer.id}</h2>
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 w-[350px] sm:max-w-md">
          <input
            type="text"
            name="id"
            placeholder="put friend ID"
            pattern={PEER_ID_PATTERN}
            className={inputClass}
            title={formatMessage({id: 'peer_id_title'}, {len: PEER_ID_LENGTH})}
            onChange={handleInput}
          />
        </div>
        <div className="flex mt-1 text-sm leading-6 text-gray-600 flex items-center">
          <input checked={!online.friend}
                 onChange={handleChange}
                 type="checkbox"
                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="inline-flex ms-2 text-sm font-medium">
            Change free matching<CloudIcon className="flex-none h-5" />
          </div>
        </div>
      </>)) : (<>
      <button onClick={onClick}
        className={"my-2 " + buttonClass}
      >Play</button>
      <div className="flex w-290 rounded-md shadow-sm ring-1 ring-inset ring-indigo-600/30 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
        <input
          type="text"
          value={online.name}
          maxLength={nameMaxLength}
          className={inputClass}
          placeholder={`put name within ${nameMaxLength}`}
          onChange={(e)=>setOnline({...online, name: e.target.value})}
        />
      </div>
      <div className="flex mt-1 text-sm leading-6 text-gray-600 flex items-center">
        <input id="friend"
               checked={online.friend}
               onChange={() => setOnline({...online, friend: !online.friend})}
               type="checkbox"
               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <Tooltip content={formatMessage({id: 'by_yourself'})} trigger="click" placement="bottom"
                 theme={toolTipBottomTheme}
        >
          <label className="inline-flex ms-2 text-sm font-medium">
            with a friend<UsersIcon className="flex-none h-5" />
          </label>
        </Tooltip>
      </div>
      </>)}
    </>
  )
}