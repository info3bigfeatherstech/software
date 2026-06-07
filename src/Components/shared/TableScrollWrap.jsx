import React from "react";

/**
 * Mobile-only horizontal table scroll wrapper.
 * Pair with table class: min-w-[720px] lg:min-w-0
 */
export default function TableScrollWrap({ children, className = "" }) {
    return (
        <div
            className={`w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain ${className}`}
        >
            {children}
        </div>
    );
}
