"use client";

import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export function FormField({ label, id, error, ...props }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-light px-4 text-black"
      >
        {label}
      </label>
      <input
        id={id}
        className={`border px-3 py-2 rounded-[10px] focus:outline-none focus:ring-0 focus:border-2 focus:border-[#CAF97C] ${
          error ? "border-red-500" : ""
        }`}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm px-4">{error}</p>
      )}
    </div>
  );
}
