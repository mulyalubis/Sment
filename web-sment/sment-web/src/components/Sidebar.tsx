import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

type Props = {
    user: { name?: string | null; email?: string | null } | null | undefined;
    heading: ReactNode;
    children: ReactNode;
};

// Ikon SVG sebaris (tanpa paket tambahan), warnanya mengikuti warna teks.
function Icon({ children }: { children: ReactNode }) {
    return (
        <svg
            className="flex-none"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const DashboardIcon = () => (
    <Icon>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
    </Icon>
);

const ReportIcon = () => (
    <Icon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
    </Icon>
);

const UsersIcon = () => (
    <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
);

const LogoutIcon = () => (
    <Icon>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
);

const MenuIcon = () => (
    <Icon>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
    </Icon>
);

const CloseIcon = () => (
    <Icon>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </Icon>
);

const NAV = [
    { to: "/", label: "Dashboard", end: true, icon: <DashboardIcon /> },
    { to: "/laporan", label: "Laporan", end: false, icon: <ReportIcon /> },
    { to: "/pengguna", label: "Pengguna", end: false, icon: <UsersIcon /> },
];

// Di bawah 768px sidebar diganti hamburger menu, jadi aside di bawah ini hanya tampil mulai 768px.
const fadeIn =
    "max-md:hidden transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100";

const linkBase =
    "flex h-12 items-center gap-3.5 whitespace-nowrap rounded-2xl px-3 font-semibold";

// Daftar menu, dipakai di sidebar desktop/tablet dan di panel hamburger.
function NavItems({ labelClass = "", onNavigate }: { labelClass?: string; onNavigate?: () => void }) {
    return (
        <>
            {NAV.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={item.label}
                    aria-label={item.label}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                        `${linkBase} ${isActive
                            ? "bg-leaf text-white"
                            : "text-muted hover:bg-ink/5 hover:text-ink"
                        }`
                    }
                >
                    {item.icon}
                    <span className={labelClass}>{item.label}</span>
                </NavLink>
            ))}
        </>
    );
}

export default function Sidebar({ user, heading, children }: Props) {
    const { signOut } = useAuthActions();
    const displayName = user?.name ?? user?.email ?? "Admin";
    const [open, setOpen] = useState(false);

    const closeMenu = () => setOpen(false);

    // Tutup dengan Escape, dan kunci scroll halaman selama menu terbuka.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    // Kalau layar melebar sampai 768px ke atas, hamburger tidak dipakai lagi, jadi tutup menunya.
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const onChange = () => {
            if (mq.matches) setOpen(false);
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return (
        <div className="flex min-h-dvh max-lg:flex-col">
            {/* Layar HP (< 768px): bilah atas dengan tombol hamburger */}
            <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface px-2.5 md:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Buka menu"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl text-ink hover:bg-ink/5"
                >
                    <MenuIcon />
                </button>
                <span className="text-[22px] font-extrabold capitalize tracking-tight text-ink">sment</span>
            </div>

            {/* Layar HP: panel menu dari kiri. Tersembunyi total (invisible) saat tertutup. */}
            <div
                className={`fixed inset-0 z-40 transition-[visibility] duration-200 md:hidden ${open ? "visible" : "invisible"
                    }`}
            >
                <div
                    onClick={closeMenu}
                    aria-hidden="true"
                    className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"
                        }`}
                />
                <aside
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu navigasi"
                    className={`absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col gap-2 border-r border-line bg-surface p-4 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="mb-2 flex items-center justify-between border-b-2 border-line pb-3.5">
                        <span className="pl-3 text-[26px] font-extrabold capitalize tracking-tight text-ink">
                            sment
                        </span>
                        <button
                            type="button"
                            onClick={closeMenu}
                            aria-label="Tutup menu"
                            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-muted hover:bg-ink/5 hover:text-ink"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1.5">
                        <NavItems onNavigate={closeMenu} />
                    </nav>

                    <button
                        type="button"
                        title="Keluar"
                        aria-label="Keluar"
                        onClick={() => void signOut()}
                        className={`${linkBase} mt-auto cursor-pointer text-muted hover:bg-ink/5 hover:text-ink`}
                    >
                        <LogoutIcon />
                        <span>Keluar</span>
                    </button>
                </aside>
            </div>

            {/* Tablet dan desktop (>= 768px): menempel di kiri, menyempit jadi ikon; saat di-hover melebar
                dan mendorong konten. Tablet: bilah di atas. */}
            <aside
                className="group sticky top-0 z-20 flex shrink-0 gap-2 overflow-hidden border-line bg-surface transition-[width] duration-200
                    max-md:hidden
                    max-lg:w-full max-lg:flex-row max-lg:items-center max-lg:border-b max-lg:p-2.5
                    lg:h-dvh lg:w-18 lg:flex-col lg:border-r lg:px-3 lg:py-6 lg:hover:w-56 lg:focus-within:w-56"
            >
                <div
                    className="grid items-center whitespace-nowrap text-[26px] font-extrabold tracking-tight text-ink lg:mb-3.5 lg:border-b-2 lg:border-line lg:pb-3.5"
                    aria-label="sment"
                >
                    {/* "s" sendirian: tampil saat sidebar menyempit */}
                    <span
                        className="col-start-1 row-start-1 w-12 text-center transition-opacity duration-100 md:max-lg:hidden lg:delay-100 lg:group-hover:opacity-0 lg:group-hover:delay-0 lg:group-focus-within:opacity-0 lg:group-focus-within:delay-0 capitalize"
                    >
                        s
                    </span>

                    {/* "sment" utuh: tampil di layar sedang, dan saat sidebar melebar */}
                    <span
                        className="col-start-1 row-start-1 pl-3 transition-opacity duration-150 max-md:hidden lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-150 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-150 text-center capitalize"
                    >
                        sment
                    </span>
                </div>

                <nav className="flex flex-col gap-1.5 max-lg:flex-1 max-lg:flex-row">
                    <NavItems labelClass={fadeIn} />
                </nav>

                <button
                    type="button"
                    title="Keluar"
                    aria-label="Keluar"
                    onClick={() => void signOut()}
                    className={`${linkBase} cursor-pointer text-muted hover:bg-ink/5 hover:text-ink lg:mt-auto`}
                >
                    <LogoutIcon />
                    <span className={fadeIn}>Keluar</span>
                </button>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 lg:px-8 lg:pb-8 lg:pt-6">
                <header className="flex items-center justify-between gap-4">
                    <h1 className="min-w-0 text-lg font-bold text-ink sm:text-xl">{heading}</h1>
                    <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-ink max-sm:hidden">{displayName}</span>
                        <span
                            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-leaf font-bold text-white"
                            aria-hidden="true"
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </header>

                {children}
            </div>
        </div>
    );
}