import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../components/Sidebar";
import UsersContent from "../components/UsersContent";

const showError = (e: unknown) =>
    window.alert(e instanceof ConvexError ? String(e.data) : "Terjadi kesalahan. Coba lagi.");

export default function Pengguna() {
    const me = useQuery(api.users.me);
    const isAdmin = me?.role === "admin";

    // "skip" supaya query khusus admin tidak dipanggil oleh akun non-admin.
    const users = useQuery(api.userAdmin.listWithStats, isAdmin ? {} : "skip");
    const changeRole = useMutation(api.userAdmin.changeRole);
    const setDisabled = useMutation(api.userAdmin.setDisabled);

    if (me === undefined) {
        return <div className="grid min-h-dvh place-items-center text-muted">Memuat…</div>;
    }
    if (me === null) {
        return (
            <div className="grid min-h-dvh place-items-center text-muted">
                Silakan masuk terlebih dahulu.
            </div>
        );
    }
    if (!isAdmin) {
        return (
            <div className="grid min-h-dvh place-items-center text-muted">
                Akun ini tidak punya akses admin.
            </div>
        );
    }

    return (
        <Sidebar
            user={me}
            heading={
                <>
                    Pengguna <span className="font-normal text-muted">({users?.length ?? 0})</span>
                </>
            }
        >
            <UsersContent
                users={users ?? []}
                onChangeRole={(u, role) =>
                    void changeRole({ id: u.id as Id<"users">, role }).catch(showError)
                }
                onSetDisabled={(u, disabled) =>
                    void setDisabled({ id: u.id as Id<"users">, disabled }).catch(showError)
                }
            />
        </Sidebar>
    );
}