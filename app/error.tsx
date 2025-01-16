"use client";

import { useEffect } from "react";

// Draft error boundary component

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Route-level error boundary:", error);
    }, [error]);

    const handleReset = () => {
        reset();
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center rounded-[20px] p-1 m-1 bg-white">
            <h2 className="text-3xl font-bold text-red-600">Упс! Щось пішло не так</h2>
            <p className="mt-2 text-gray-700 max-w-md text-center">
                Ми не змогли завантажити сторінку. Спробуйте перезавантажити.
            </p>
            <button
                onClick={handleReset}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-3xl"
            >
                Спробувати знову
            </button>
        </div>
    );
}
