'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';

export default function Toggle({ data, setData }) {
  const [enabled, setEnabled] = useState(false);

  // Sync toggle state with initial form value
  useEffect(() => {
    setEnabled(Boolean(data.isPresell));
  }, [data.isPresell]);

  const handleToggle = (value) => {
    setEnabled(value);
    setData('isPresell', value);
    console.log('isPresell:', value);
  };

  return (
    <Switch
      checked={enabled}
      onChange={handleToggle}
      className={`${
        enabled ? 'bg-accent' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </Switch>
  );
}
