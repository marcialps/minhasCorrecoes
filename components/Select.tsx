import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  className = '',
  ...props
}) => {
  const baseStyles = 'block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out bg-gray-700 text-gray-100';

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className={`${baseStyles}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;