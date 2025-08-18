import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md px-3 py-3 border-gray-200 shadow-sm text-gray-600 focus:ring-1 focus:border-green-600 focus:ring-green-200 dark:border-green-700 dark:bg-gray-900 dark:text-green-300 dark:focus:border-green-600 dark:focus:ring-green-600 ' +
                className
            }
            ref={localRef}
        />
    );
});
