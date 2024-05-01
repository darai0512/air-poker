import Link from 'next/link'
import Image from "next/image"
import "./globals.css";
import "./components/_Bubble.scss";
import {LanguageIcon} from "@heroicons/react/16/solid";
import { Dropdown, DropdownItem, Tooltip, CustomFlowbiteTheme } from 'flowbite-react'
import {getLocale} from './server/locale'
import i18n, {title, toolTipBottomTheme} from './components/const'
import { Inter } from 'next/font/google'
import type { Metadata } from "next"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
const description = "Online game of Air Poker by Usogui (by Toshio Sako, vol.40-43)"
const url = process.env.URL || 'http://localhost:3000'
export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    title,
    description,
    images: `${url}/images/bg.webp`,
    url,
    siteName: title,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
    site: '@darai_0512',
    creator: '@darai_0512',
  },
}

const dropdownTheme: CustomFlowbiteTheme['dropdown'] = {
  floating: {
    style: {
      auto: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
      dark: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
      light: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
    },
    item: {
      container: "text-gray-400 [text-shadow:initial]",
    }
  },
  inlineWrapper: "flex items-center [text-shadow:inherit]",
  arrowIcon: "ml-1 h-4 w-4 text-gray-400",
}
export default async function RootLayout({
  children,
  rule,
  params
}: Readonly<{
  children: React.ReactNode
  rule: React.ReactNode
  params: Object
}>) {
  const lang = await getLocale(null) // not include searchParams
  return (
    <html lang={lang}>
      <body className={inter.className + ' min-h-screen min-w-[420px]'}>
        <header className="text-white/50 text-sm font-semibold leading-6 [text-shadow:_1px_1px_0_black]">
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <Image src="/images/logo.png"
                     alt="logo"
                     width={32}
                     height={32}
                     priority
                     style={{
                       width: '32px',
                       height: '32px',
                     }}
              />
            </div>
            <div className="flex gap-x-4 sm:gap-x-8">
              <a href="https://forms.gle/iC5eQJkyoHMKATpx5" target="_blank">
                Issue
              </a>
              <Tooltip content={i18n[lang].status} theme={toolTipBottomTheme} placement="bottom">
                <a href="https://status.peerjs.com/" target="_blank">Status</a>
              </Tooltip>
              <Tooltip content={rule} theme={toolTipBottomTheme} placement="bottom" trigger="click">
                <div className="cursor-help" id="rule">Rule</div>
              </Tooltip>
              <a href="https://www.amazon.co.jp/dp/B01ABUDZJQ/ref=nosim?tag=papuwa-22" target='_blank'>
                Buy
              </a>
              <Dropdown dismissOnClick={false}
                        label="Games"
                        theme={dropdownTheme}
                        inline>
                <DropdownItem as={Link} href="/">Air Poker</DropdownItem>
                <DropdownItem as="a" href="https://to-court-the-king-js.vercel.app" target="_blank">{i18n[lang].toCourtTheKing}</DropdownItem>
              </Dropdown>
            </div>
            <div className="lg:flex lg:flex-1 lg:justify-end">
              <Dropdown dismissOnClick={false}
                        label={<LanguageIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                        theme={dropdownTheme}
                        inline>
                <DropdownItem as={Link} href="/?lang=ja">日本語</DropdownItem>
                <DropdownItem as={Link} href="/?lang=en">English</DropdownItem>
              </Dropdown>
            </div>
          </nav>
        </header>
        <main className="flex flex-col items-center px-2 sm:px-10">
          {children}
        </main>
        <footer className="sticky top-[100vh] w-full text-center p-1 md:py-2">
          <hr className="my-1 border-gray-200 lg:my-2" />
          <span className="text-sm text-gray-400">
            © 2024 by daraiii (
            <a href="https://github.com/darai0512/air-poker/issues/new/choose" className="underline decoration-dashed" target='_blank'>contact</a>)
          </span>
        </footer>
        <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js" async></script>
      </body>
    </html>
  )
}