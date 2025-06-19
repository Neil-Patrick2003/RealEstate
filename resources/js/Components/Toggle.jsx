'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';

export default function Toggle({ data, setData }) {
  const [enabled, setEnabled] = useState(false);

  // Set initial state from data.isPresell (e.g., "yes" or true)
  useEffect(() => {
    setEnabled(data.isPresell === true || data.isPresell === 'yes');
  }, [data.isPresell]);

  const toggle = (value) => {
    setEnabled(value);
    setData('isPresell', value); // or use 'yes'/'no' if needed
    console.log('isPresell:', value);
  };

  return (
    <Switch
      checked={enabled}
      onChange={toggle}
      className={`${
        enabled ? 'bg-accent' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </Switch>
  );
}
