import type { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "primary" | "ghost";
};

export default function Button({
    loading = false,
    variant = "primary",
    disabled,
    className = "",
    children,
    ...rest
}: Props) {
    const styles =
        variant === "primary"
            ? "bg-accent text-on-accent hover:brightness-95"
            : "border border-line text-ink hover:bg-surface-alt";

    return (
        <button
            disabled={disabled || loading}
            aria-busy={loading}
            className={`inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold
        transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf
        disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
            {...rest}
        >
            {loading && <Spinner className="size-4" />}
            {children}
        </button>
    );
}
