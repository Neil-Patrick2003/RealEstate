'use client';

import { Switch } from '@headlessui/react';

export default function AllowMultiAgentToggle({ data, setData }) {
    const handleToggle = (value) => {
        setData('allowMultipleAgent', value);
        console.log('allowMultipleAgent:', value);
    };

    return (
        <Switch
            checked={!!data.allowMultipleAgent}
            onChange={handleToggle}
            className={`${
                data.allowMultipleAgent ? 'bg-accent' : 'bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
        >
      <span
          className={`${
              data.allowMultipleAgent ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
        </Switch>
    );
}
