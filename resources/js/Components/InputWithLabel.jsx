export default function FloatingInput({ id, label, value, onChange, name, type = "text", required = true }) {
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
        className="peer w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-700 placeholder-transparent transition focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
      />
      <span
        className="absolute left-4 top-2 bg-white px-1 text-xs text-gray-600 uppercase tracking-wide transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-2
          peer-placeholder-shown:text-xs
          peer-focus:text-xs
          peer-focus:top-[-10px]
          peer-valid:text-xs
          peer-valid:top-[-10px]"
      >
        {label}
      </span>
    </label>
  );
}
