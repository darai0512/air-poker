'use client'
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTitle,
  List,
  ListItem,
} from "flowbite-react"
import Link from 'next/link'
import {ExclamationCircleIcon} from "@heroicons/react/16/solid"
import {I18nStr} from '~/app/components/const'

const rule = {
  ja: (<div className="max-h-[85vh] overflow-y-auto scrollbar-none px-2">
<div className="italic text-center items-center">
エア・ポーカーは「嘘喰い（著: 迫稔雄）」の作中内ゲーム（40~43巻）です。<br/>
以下のルール説明はネタバレにあたるためご注意ください。
</div>
<hr className="my-4 border-gray-200 lg:my-8"/>
<div className="text-center items-center mb-2">
あなたと相手は水没した部屋でair（空気入りチップ）を賭け対戦します。<br/>
25 air を与えられますが、毎ラウンド始まりに、呼吸のため 1 air を消費します...<br/>
</div>
<Timeline>
  <TimelineItem>
    <TimelinePoint/>
    <TimelineContent>
      <TimelineTitle>1. 手札1枚を裏向きに場へ出す</TimelineTitle>
      <TimelineBody className="text-white">
        5枚の手札から、ラウンド毎に1枚場に出します（ドラッグ&ドロップ）。<br/>
        ※ 制限時間(60秒)を超えると自動選択されます。<br/>
        ※ モバイル等のタッチスクリーンでは数字長押しでドラッグ可能です。<br/>
        <br/>
        手札の数字は（スート任意の）トランプ5枚分の数字の和を表します。<br/>
        互いに場へ出したら(<Link href="#rule-2-2" className="underline">2-2.</Link>)、数字を満たすポーカーの役を作り合います。<br/>
        トランプは1デッキを共有し、使用されたカードは使えません。<br/>
        <br/>
        <List className="text-white">
          <ListItem icon={ExclamationCircleIcon}>数字をクリック: 現在作成可能な役の一覧を表示</ListItem>
          <ListItem icon={ExclamationCircleIcon}>Cardsボタン: 残りのトランプを確認</ListItem>
        </List>
      </TimelineBody>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelinePoint/>
    <TimelineContent>
      <TimelineTitle id="rule-2-1">2-1. airを賭ける</TimelineTitle>
      <TimelineBody className="text-white">
        場代としてRound数と同じairが自動的にBetされます。<br/>
        <Link href="#rule-2-2" className="underline">2-2.</Link>と並行して、30秒制限のBet（以下）を繰り返します。<br/>
        ※ 制限時間を超えるとCHECKかFOLDが自動選択されます。<br/>
        <br/>
        <Table>
          <TableHead>
            <TableHeadCell>Betボタン</TableHeadCell>
            <TableHeadCell>説明</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            <TableRow>
              <TableCell>
                CHECK
              </TableCell>
              <TableCell>
                パスします（一度もRAISEされていない場合のみ可能）。<br/>
                互いにCHECKなら、互いに役を確定後、判定に移ります。
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                RAISE
              </TableCell>
              <TableCell>
                相手のRAISE分(CHECKなら0) + 上乗せ分、を賭けます。<br/>
                上限:「互いの残air」or「場のBet総額の半分」の小さい方<br/>
                <p className="flex"><ExclamationCircleIcon className="flex-none h-4" />
                  &nbsp;スライダーで上乗せ分を調整できます</p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                CALL
              </TableCell>
              <TableCell>
                相手のRAISEに対し、同じairを賭けます。<br/>
                互いに役を確定後、判定に移ります。
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                FOLD
              </TableCell>
              <TableCell>
                このラウンドが敗北扱いとなります。<br/>
                役が未確定のプレイヤーがいても、判定に移ります。<br/>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <br/>
        ※ Bet順は、1ラウンド目は場の数字が小さいプレイヤーから<br/>
        （同じ場合はランダム）。次ラウンド以降は交互。
      </TimelineBody>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelinePoint/>
    <TimelineContent>
      <TimelineTitle id="rule-2-2">2-2. 役を作る</TimelineTitle>
      <TimelineBody className="text-white">
        <Link href="#rule-2-1" className="underline">2-1.</Link>と並行して、100秒以内に役を作ってください。<br/>
        役を確定させると、相手の数字がオープンされます。<br/>
        （あなたの数字が表になる＝相手の役が確定した）<br/>
        <br/>
        ※（カード消費やミスで）合計数値が一致しない役作りをした場合、<br/>
        制限時間超えで役を作れなかった場合は、<br/>
        自動的に無役（最低役、カード消費なし）となります。<br/>
        例.<br/>
        47でロイヤルストレートフラッシュ(10, J, Q, K, A)を作ると、次ラウンド<br/>
        以降は6を出してもフォーカード(A, A, A, A, 2)は作れず、無役となります。<br/>
        <br/>
        <List className="text-white">
          <ListItem icon={ExclamationCircleIcon}>タイマーボタン: 役を作るモーダルを開閉</ListItem>
          <ListItem icon={ExclamationCircleIcon}>確定ボタン: カード5枚を選ぶと押下可能。押下で即確定</ListItem>
          <ListItem icon={ExclamationCircleIcon}>「待機中...」点滅クリック: 確定させた役を確認</ListItem>
        </List>
      </TimelineBody>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelinePoint/>
    <TimelineContent>
      <TimelineTitle id="rule-3">3. ラウンド勝敗判定</TimelineTitle>
      <TimelineBody className="text-white">
        FOLDされていない場合は、ポーカーの役の強さを比較します<br/>
        （同役は構成カードの強さを比較。スートの序列は無し）。<br/>
        ※ ドローの場合はそのラウンドで先にBetしたプレイヤーが勝利<br/>
        <br/>
        互いに同じカード（同数字・同スート）を消費した場合「<span
        className="italic font-bold">天災</span>」が発生し、<br/>
        敗者は追加でBetしたairと同数のairを水中に放出します。<br/>
        <br/>
        <List className="text-white">
          <ListItem icon={ExclamationCircleIcon}>プレイヤー名をクリック: 過去ラウンドの履歴を確認</ListItem>
        </List>
      </TimelineBody>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelinePoint/>
    <TimelineContent>
      <TimelineTitle>ゲーム勝敗判定</TimelineTitle>
      <TimelineBody className="text-white">
        1,2を繰り返し、airが尽きるか、<br/>
        5ラウンド終了後に相手よりairが少ないプレイヤーが敗者です。
      </TimelineBody>
    </TimelineContent>
  </TimelineItem>
</Timeline>
<div className="flex justify-center items-center">
  <iframe width="315" height="560"
          src="https://www.youtube.com/embed/14ZnOYgZJ8U"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  ></iframe>
</div>
</div>),
  en: (<div className="max-h-[85vh] overflow-y-auto scrollbar-none px-2">
    <div className="italic text-center items-center">
      Air Poker is a game made by Japanese comic &quot;Usogui&quot; (by Toshio Sako, vol.40-43).<br/>
      Please be aware that the following rule explanations may contain spoilers.
    </div>
    <hr className="my-4 border-gray-200 lg:my-8"/>
    <div className="text-center items-center mb-2">
      You have 25 &quot;air&quot; (as the poker tips) in a submerged room...<br/>
      At the beginning of each round, 1 air is consumed for breathing.
    </div>
    <Timeline>
      <TimelineItem>
        <TimelinePoint/>
        <TimelineContent>
          <TimelineTitle>1. Select 1 card face down on the field</TimelineTitle>
          <TimelineBody className="text-white">
            The numbers in your hand (×5) represent the sum of<br/>
            the numbers on 5 playing cards without suits.<br/>
            Drag & drop 1 card from your hand on the field each round.<br/>
            ※ If over 60 seconds, automatically selected at random.<br/>
            ※ On touch screens, you can drag a number by holding it.<br/>
            <br/>
            After both players placed their cards, form a poker hand.(<Link href="#rule-2-2" className="underline">2-2.</Link>)<br/>
            Available cards share one deck with each other and can only be used once.<br/>
            <br/>
            <List className="text-white">
              <ListItem icon={ExclamationCircleIcon}>Click hand number: Display a list of currently possible hands</ListItem>
              <ListItem icon={ExclamationCircleIcon}>Cards button: Check the remaining playing cards</ListItem>
            </List>
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint/>
        <TimelineContent>
          <TimelineTitle>2-1. Bet your air</TimelineTitle>
          <TimelineBody className="text-white">
            At first, the same amount of air as the round number is bet as entry fee.<br/>
            Select the following clickable action within 30 seconds, and<br/>
            concurrently play <Link href="#rule-2-2" className="underline">2-2</Link>.<br/>
            * If the time limit is exceeded, CHECK or FOLD is automatically selected.<br/>
            <br/>
            <Table>
              <TableHead>
                <TableHeadCell>Bet</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                <TableRow>
                  <TableCell>
                    CHECK
                  </TableCell>
                  <TableCell>
                    You pass, if nobody choices RAISE.<br/>
                    If both players CHECK, move <Link href="#rule-3" className="underline">3. judgement</Link> after they play <Link href="#rule-2-2" className="underline">2-2</Link>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    RAISE
                  </TableCell>
                  <TableCell>
                    You bet the opponent&apos;s RAISE (or 0 if CHECK) air + extra air.<br/>
                    The limit is the smaller of &quot;each player&apos;s remaining air&quot; or<br/>
                    &quot;half the total betting air on the table&quot;.
                    <p className="flex"><ExclamationCircleIcon className="flex-none h-4" />
                      &nbsp;Use the slider to adjust the amount of extra air.</p>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    CALL
                  </TableCell>
                  <TableCell>
                    Against an opponent&apos;s RAISE, you bet the same amount of air.<br/>
                    Move <Link href="#rule-3" className="underline">3. judgement</Link> after they play <Link href="#rule-2-2" className="underline">2-2</Link>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    FOLD
                  </TableCell>
                  <TableCell>
                    You will lose this round immediately.<br/>
                    (even if there is a player whose has not yet played <Link href="#rule-2-2" className="underline">2-2.</Link>)
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            ※ At the 1st round, bet starts with the player with the lowest number (or<br/>
            randomly if the same).<br/>
            From next round, bet alternates.<br/>
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint/>
        <TimelineContent>
          <TimelineTitle id="rule-2-2">2-2. Making a Hand</TimelineTitle>
          <TimelineBody className="text-white">
            Simultaneously with <Link href="#rule-2-1" className="underline">2-1.</Link>, please make a hand within 100 seconds.<br/>
            When you fix a poker hand, the opponent&apos;s number is opened.(vice versa)<br/>
            <br/>
            If you failed to make a poker hand (= the sum of 5 cards not match<br/>
            your number), or if over 100 seconds, you become no-rank. (= the <br/>
            Lowest rank of all poker hands, no card consumption)<br/>
            ex,<br/>
            If you make 47 Royal Straight Flush (10, J, Q, K, A), your number of 6<br/>
            do not become Four of a Kind (A, A, A, A, 2). It will be a no-rank.<br/>
            <br/>
            <List className="text-white">
              <ListItem icon={ExclamationCircleIcon}>Timer button: open modal to make your poker hand</ListItem>
              <ListItem icon={ExclamationCircleIcon}>Make button: fix your hand (※ you cannot undo) after select 5 cards.</ListItem>
              <ListItem icon={ExclamationCircleIcon}>Click &quot;Waiting...&quot;: check your fixed hand</ListItem>
            </List>
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint/>
        <TimelineContent>
          <TimelineTitle id="rule-3">3. Judgement</TimelineTitle>
          <TimelineBody className="text-white">
            If nobody FOLD, compare the poker rank from your poker hand.<br/>
            (The same role compares the strength of the component cards.<br/>
            There is no order of suit.)<br/>
            ※ In the case of a draw, the first bet player wins.<br/>
            <br/>
            If both players use the same number & suit, <span className="italic font-bold">Disaster</span> occurs.<br/>
            The loser releases the same amount of air as bet air into the water.<br/>
            <br/>
            <List className="text-white">
              <ListItem icon={ExclamationCircleIcon}>Click near player name: view logs up to previous rounds</ListItem>
            </List>
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint/>
        <TimelineContent>
          <TimelineTitle>Win Condition</TimelineTitle>
          <TimelineBody className="text-white">
            Repeat the above, and the loser is the player who<br/>
            running out of air or fewer air than the opponent after 5th round.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
    <div className="flex justify-center items-center">
      <iframe width="315" height="560"
              src="https://www.youtube.com/embed/14ZnOYgZJ8U"
              title="AirPoker screen explanation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      ></iframe>
    </div>
  </div>)
}

export default function Rule({locale}: {locale: I18nStr}) {
  return rule[locale]
}