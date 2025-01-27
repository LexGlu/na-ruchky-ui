"use client";

import React from "react";
import classNames from "classnames";

interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "required"> {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  showRequiredIndicator?: boolean;
}

export function FormField({
  label,
  id,
  error,
  required = false,
  showRequiredIndicator = false,
  className = "",
  ...props
}: FormFieldProps) {
  const inputClasses = classNames(
    "border px-3 py-2 rounded-[10px]",
    "focus:outline-none focus:ring-0 focus:border-2 focus:border-[#CAF97C]",
    { "border-red-500": error },
    className
  );

  const labelClasses = classNames(
    "font-light px-4 text-black flex items-center gap-1"
  );

  const errorClasses = classNames("text-red-600 text-sm px-4");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && showRequiredIndicator && (
          <span className="text-red-500 font-bold">*</span>
        )}
      </label>
      <input id={id} className={inputClasses} required={required} {...props} />
      {error && <p className={errorClasses}>{error}</p>}
    </div>
  );
}
