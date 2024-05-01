'use client'

import {buttonClass} from "~/app/components/const";
import { useSearchParams } from "next/navigation"
import i18n, {defaultLng, I18nStr} from './components/const'

const lngs = Object.keys(i18n) as I18nStr[]

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useSearchParams()
  const lang = lngs.includes(params.get('lang') as any) ? params.get('lang') as I18nStr : defaultLng
  return (
    <>
      <button className={"my-2 " + buttonClass} onClick={reset}>
        Restart
      </button>
      <h1>{i18n[lang]['error']}</h1>
      <div>{i18n[lang]['error.report']}</div>
      <a href="https://github.com/darai0512/air-poker/issues/new?template=1-bug-report.yml"
         target="_blank"
      >
        <button className={"my-2 " + buttonClass}>
          Report Bugs
        </button>
      </a>
      <div>Error message:</div>
      <div>{(typeof error === 'string' ? error : error.message) || 'none'}</div>
    </>
  )
}
