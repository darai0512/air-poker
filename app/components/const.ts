import type {CustomFlowbiteTheme} from "flowbite-react";
import {SUITS} from "~/src/AirPoker";

export const nameMaxLength = 10
export const PEER_ID_LENGTH = 36
export const PEER_ID_PATTERN = `^[0-9a-zA-Z_\\- ]{${PEER_ID_LENGTH}}$`
export const buttonClass = "w-[70px] sm:w-[100px] flex justify-center rounded-md border" +
  " border-transparent bg-indigo-600 py-3 text-base font-medium text-white hover:bg-indigo-700" +
  " focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-500"
export const handSizeClass = "w-[75px] sm:w-[100px] h-[110px] sm:h-[147px]"
export const handClass = "flex justify-center items-center font-['Luminari'] text-[60px]/[60px] rounded front"
export const handEmptyClass = handSizeClass + " border-4 rounded cursor-default"
export const trumpSizeClass = " sm:w-[35px] sm:h-[45px] w-[31px] h-[41px]"
export const trumpMiniClass = " w-[20px] h-[20px]"
export const trumpClass = "rounded border flex justify-between" // + size
const toolTipArrow = "absolute z-10 h-2 w-2 tri"
export const toolTipTheme: CustomFlowbiteTheme['tooltip'] = {
  arrow: {
    base: toolTipArrow + " rotate-[135deg]",
  },
  style: {
    dark: "bg-gray-700/50 [text-shadow:initial] text-white",
    light: "bg-gray-700/50 [text-shadow:initial] text-white",
    auto: "bg-gray-700/50 [text-shadow:initial] text-white",
  }
}
export const toolTipBottomTheme: CustomFlowbiteTheme['tooltip'] = {
  ...toolTipTheme,
  arrow: {
    base: toolTipArrow + " rotate-[-45deg]",
  },
}
export const suitMap: Record<string, Record<string, string>> = {
  [SUITS.HEART]: {
    symbol: '♥️',
    className: 'text-[color:red]',
  },
  [SUITS.SPADE]: {
    symbol: '♠️️',
    className: 'text-[color:black]',
  },
  [SUITS.CLUB]: {
    symbol: '♣️',
    className: 'text-[color:black]',
  },
  [SUITS.DIAMOND]: {
    symbol: '♦️',
    className: 'text-[color:red]',
  },
}
export const cardMark: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K'
}

const peerJsErrors: Record<string, Record<string, string>> = {
  'browser-incompatible': {
    ja: 'FATAL: ブラウザが対応していません',
    en: "FATAL: The client's browser does not support some or all WebRTC features that you are trying to use.",
  },
  disconnected: {
    ja: 'このIDは既に接続不可状態です。リロードしてやり直して下さい。',
    en: "You've already disconnected this peer from the server and can no longer make any new connections on it.",
  },
  'invalid-id': {
    ja: 'FATAL: IDが存在しません',
    en: 'FATAL: The ID passed into the Peer constructor contains illegal characters.',
  },
  'invalid-key': {
    ja: 'FATAL: APIキーが不正です',
    en: 'FATAL: The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).',
  },
  network: {
    ja: 'オンライン用サーバーが混み合っています。{br}時間を置いてお試し下さい。',
    en: 'Cannot establish a connection to the online(signalling) server.{br}Wait & retry for a while.'
  },
  'peer-unavailable': {
    ja: 'このIDは既に他のhostに所属済みです',
    en: "The peer you're trying to connect to does not exist.(ex, The ID connected already another host.)"
  },
  'ssl-unavailable': {
    ja: 'FATAL: セキュアな通信ができません。他のブラウザでお試し下さい。',
    en: 'PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.',
  },
  'server-error': {
    ja: 'FATAL: WebRTCサーバーと接続できません',
    en: 'FATAL: Unable to reach the server.',
  },
  'socket-error': {
    ja: 'FATAL: ソケット上でエラーが発生し、切断しました',
    en: 'FATAL: An error from the underlying socket.',
  },
  'socket-closed': {
    ja: 'FATAL: ソケットがクローズ状態となり、切断しました',
    en: 'FATAL: The underlying socket closed unexpectedly.',
  },
  'unavailable-id': {
    ja: 'あなたのIDは現在使用できません。リロードしてやり直してください。',
    en: 'The ID passed into the Peer constructor is already taken.',
  },
  webrtc: {
    ja: 'WebRTC固有のエラーが発生しました。',
    en: 'Native WebRTC errors.'
  },
}

export const title = 'AirPoker'
interface I18n {
  ja: string
  en: string
}
export const defaultLng: I18nStr = 'en'
export type I18nStr = keyof I18n
const i18n: Record<I18nStr, Record<string, string>> = {
  en: {
    "toCourtTheKing": "To Court the King",
    "invalid_data": "Invalid data selected",
    "invalid_connection": "Failed to connect opponent.",
    "invalid_key": "Data not found. Please reload to restart game.",
    "non_host_connection_close": "Disconnected with your opponent. Reload & restart",
    "host_connection_close": "This ID is already connected with you or another host",
    "peer_id_title": "ID is within {len} (letters including '-','_' & ' ')",
    "online_name": "Name is within 10 letters",
    "order": "Play from top to bottom on Round 1.(You can move them by dragging and dropping)",
    "online": "・This is beta.{br}・No auto matching. Please share your ID to host by yourself.{br}・Not crack down on Glitch/Delay.{br}・If disconnected, may become offline mode.",
    "entry": "Entry fee",
    "peer_id_registered": "Your ID was already in the waiting list.",
    "make_rank": "Make the rank by 5 cards so that the total is {sum}.",
    "remaining": "remaining cards",
    "status": "Status page of Online mode (WebRTC server)",
    "error": "Something went wrong!",
    "error.report": "Please report it(only 10 seconds)",
    "betting": "opponent betting...",
    "waiting": "Waiting...",
    "make_pairs": "Make pairs within deadline",
    "no_rank": "no-rank",
    "no_pairs": "No pairs...",
    "by_yourself": "To play by yourself, check here & use multi browsers.",
    "make_button_value": "Make",

    "win": "You win! You're alive",
    "lose": "Game Over, you're drowned...",
    ...Object.keys(peerJsErrors).reduce((a, v) => ({...a, [v]: peerJsErrors[v].en}), {}),
  },
  ja: {
    "toCourtTheKing": "王への請願",
    "invalid_data": "不正なデータ選択です",
    "invalid_connection": "相手との接続が切断されました。リロードして初めからやり直してください。",
    "invalid_key": "データが見つかりません。リロードして初めからやり直してください。",
    "non_host_connection_close": "対戦相手との接続が切断されました。リロードしてください。",
    "host_connection_close": "既に（他の）ホストと通信済みのIDです",
    "peer_id_title": "IDは{len}文字の英数字およびハイフン、アンダースコア、スペースからなる文字列です",
    "online_name": "1~10文字で命名ください",
    "order": "Round 1は上から順に行います。ドラッグ&ドロップで移動できます。",
    "online": "・オンライン機能は改善中です{br}・マッチング機能は現在ありません。発行されたIDを自身でホストにシェアください{br}・不正・遅延の対策機能はありません{br}・接続切れ端末は一人回しモードに移行することがあります",
    "entry": "場代",
    "peer_id_registered": "既に登録済のIDです",
    "make_rank": "合計が{sum}になるよう5枚を選び役を作れ！",
    "remaining": "残りカード一覧",
    "status": "オンライン通信(WebRTC)サーバーのステータス",
    "error": "問題が発生しました",
    "error.report": "以下'Error message'をコピペいただき、レポートお願いします(10秒程度)",
    "betting": "対戦相手がBet中...",
    "waiting": "待機中...",
    "make_pairs": "制限時間までに役を作れ",
    "no_rank": "無役",
    "no_pairs": "作れる役がありません",
    "by_yourself": "一人回しもできます(要複数ブラウザ)", // todo 現状複数タブでも可能だがrecoveryをcookieで行う場合は別ブラウザ
    "make_button_value": "確定",

    "win": "You win! You're alive",
    "lose": "Game Over, you're drowned...",
    ...Object.keys(peerJsErrors).reduce((a, v) => ({...a, [v]: peerJsErrors[v].ja}), {}),
  },
}

export default i18n