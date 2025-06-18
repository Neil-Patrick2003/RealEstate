'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'

export default function Toggle({data, setData}) {
  const [enabled, setEnabled] = useState(false)

  

  const toggle = () => {
    setEnabled(!enabled),
    setData('isPresell', enabled)
    console.log(data.isPresell)
  }

  return (
    <Switch
      checked={enabled}
      onChange={toggle}
      className={`${enabled ? 'bg-green-600' : 'bg-gray-200'}
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
    >
      <span
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'}
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </Switch>
  )
}
