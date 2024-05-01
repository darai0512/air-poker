'use client'
import {forwardRef, memo} from "react";
import {useIntl} from "react-intl";

const Loading = forwardRef(function Loading({
  id = 'loading', h = 60}: {id?: string, h?: number}, ref?: any) {
  const {formatMessage} = useIntl()
  return (
    <div className={`flex items-center h-${h} flex-col justify-center`} ref={ref}>
      <div className="px-3 py-1 text-xs font-medium leading-none text-blue-800 bg-blue-200 rounded-full animate-pulse">
        {formatMessage({id})}
      </div>
    </div>
  )
})

export default Loading