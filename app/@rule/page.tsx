import {getLocale} from '~/app/server/locale'
import i18n from '~/app/components/const'
import Rule from './main'
import Provider from '~/app/components/provider'

export default async function Home({searchParams}: {searchParams: Record<string, string>}) {
  const intl = await getLocale(searchParams.lang)

  return (
    <Provider messages={i18n[intl]} locale={intl}>
      <Rule locale={intl} />
    </Provider>
  )
}