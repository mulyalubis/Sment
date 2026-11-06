import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    label: string;
    error?: string;
};

function EyeIcon({ off }: { off: boolean }) {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {off && <path d="M3 3l18 18" />}
        </svg>
    );
}

export default function TextField({ label, error, type = "text", className = "", ...rest }: Props) {
    const id = useId();
    const isPassword = type === "password";
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-semibold text-ink">
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`h-12 w-full rounded-xl border-2 bg-surface-alt px-4 text-base text-ink
            placeholder:text-muted outline-none transition
            ${error ? "border-danger" : "border-line focus:border-leaf"}
            ${isPassword ? "pr-12" : ""} ${className}`}
                    {...rest}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
                        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf"
                    >
                        <EyeIcon off={visible} />
                    </button>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
