export default function FloatingInput({
                                          id,
                                          label,
                                          value,
                                          onChange,
                                          name,
                                          type = "text",
                                          required = true,
                                      }) {
    return (
        <label htmlFor={id} className="relative block w-full">
            <input
                id={id}
                name={name}
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                placeholder=" "
                className="peer w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 bg-white placeholder-transparent transition focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
            <span
                className="absolute left-4 text-gray-500 uppercase tracking-wide bg-white px-1 text-sm transition-all duration-200 pointer-events-none
          top-1/2 -translate-y-1/2
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
          peer-focus:top-[-4px] peer-focus:text-emerald-600 peer-focus:text-xs
          peer-valid:top-[-4px] peer-valid:text-xs"
            >
        {label}
      </span>
        </label>
    );
}
