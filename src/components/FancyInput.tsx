import React, { useRef, forwardRef, useImperativeHandle } from 'react';

export interface FancyInputHandle {
  focusInput: () => void;
}

interface FancyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <input
      ref={inputRef}
      {...props}
      style={{ border: '2px solid #4f46e5', borderRadius: 4, padding: 8, ...props.style }}
    />
  );
});

export default FancyInput; 