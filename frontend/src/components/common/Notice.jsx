import React from "react";

export function Notice({ notice, clear }) {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(clear, 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [visible, clear]);

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl border px-6 py-4 font-bold max-w-md shadow-2xl transition-all duration-300 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${notice.type === "error" ? "border-red-600 bg-red-900 text-red-100" : "border-teal-600 bg-teal-900 text-teal-100"}`}>
            <div className="flex items-center justify-between gap-4">
                <span>{notice.text}</span>
                <button onClick={() => setVisible(false)} className="text-lg leading-none opacity-70 hover:opacity-100 flex-shrink-0">&times;</button>
            </div>
        </div>
    );
}
