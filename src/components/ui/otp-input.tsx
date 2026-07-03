import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, disabled }) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current = inputsRef.current.slice(0, length);
    }, [length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newValue = value.split('');
        newValue[idx] = val.substring(val.length - 1);
        const newString = newValue.join('');
        onChange(newString);

        if (val && idx < length - 1) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    ref={(el) => { if (el) inputsRef.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={value[idx] || ''}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-12 h-14 text-center text-2xl border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all font-bold"
                    disabled={disabled}
                />
            ))}
        </div>
    );
};
