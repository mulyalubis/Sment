import Spinner from "./Spinner";

export default function FullScreenSpinner() {
    return (
        <div className="grid min-h-dvh place-items-center text-leaf" role="status" aria-label="Memuat">
            <Spinner className="size-8" />
        </div>
    );
}
