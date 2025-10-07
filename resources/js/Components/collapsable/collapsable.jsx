import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Collapsable({
                                        title = "Click to toggle",
                                        description,
                                        children,
                                        defaultOpen = true,
                                        open: openProp,
                                        onToggle,
                                        disabled = false,
                                        className = "",
                                    }) {
    const isControlled = typeof openProp === "boolean";
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = isControlled ? openProp : uncontrolledOpen;
    const setOpen = (v) => {
        if (!isControlled) setUncontrolledOpen(v);
        onToggle?.(v);
    };

    const contentRef = useRef(null);
    const innerRef = useRef(null);
    const endListenerRef = useRef(null);
    const transitioningRef = useRef(false);
    const contentId = useId();

    /** Helper: animate to a specific height (in px). Resolves after transition end (or immediate). */
    const animateHeight = (toPx) => {
        const el = contentRef.current;
        if (!el) return;
        const style = el.style;

        // If user prefers reduced motion, snap
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Remove any previous end listener
        if (endListenerRef.current) {
            el.removeEventListener("transitionend", endListenerRef.current);
            endListenerRef.current = null;
        }

        // Ensure we transition height only
        el.style.overflow = "hidden";
        el.style.transitionProperty = prefersReduced ? "none" : "height";
        el.style.transitionDuration = prefersReduced ? "0ms" : "300ms";
        el.style.transitionTimingFunction = "ease-in-out";

        const current = el.getBoundingClientRect().height;
        const target = Math.max(0, toPx);

        // If no motion or no change needed, set and return
        if (prefersReduced || current === target) {
            style.height = `${target}px`;
            // If opening to a nonzero height, snap to auto after paint
            if (target > 0) {
                requestAnimationFrame(() => {
                    style.height = "auto";
                });
            }
            return;
        }

        transitioningRef.current = true;

        // Start from current computed height (px)
        style.height = `${current}px`;

        // Next frame: go to target
        requestAnimationFrame(() => {
            style.height = `${target}px`;

            const onEnd = (e) => {
                if (e.target !== el || e.propertyName !== "height") return;
                el.removeEventListener("transitionend", onEnd);
                endListenerRef.current = null;
                transitioningRef.current = false;

                // If opening, switch to auto so content can grow/shrink naturally
                if (target > 0) {
                    style.height = "auto";
                }
            };

            endListenerRef.current = onEnd;
            el.addEventListener("transitionend", onEnd, { once: true });
        });
    };

    /** When `open` changes, perform the correct animation. */
    useEffect(() => {
        const contentEl = contentRef.current;
        const innerEl = innerRef.current;
        if (!contentEl || !innerEl) return;

        if (open) {
            // OPEN: from current (0 or px) → inner height, then set to auto on end
            const target = innerEl.getBoundingClientRect().height;
            animateHeight(target);
        } else {
            // CLOSE: normalize auto → px first, then animate to 0
            if (contentEl.style.height === "" || contentEl.style.height === "auto") {
                const h = innerEl.getBoundingClientRect().height;
                contentEl.style.height = `${h}px`;
            }
            animateHeight(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    /** Keep open panel synced when its children resize (e.g., async content). */
    useLayoutEffect(() => {
        const contentEl = contentRef.current;
        const innerEl = innerRef.current;
        if (!contentEl || !innerEl) return;
        if (typeof ResizeObserver !== "function") return;

        const ro = new ResizeObserver(() => {
            if (!open) return;
            // If we're mid transition, let the transition finish
            if (transitioningRef.current) return;

            // If height is auto, briefly set to exact px then revert to auto next frame
            if (contentEl.style.height === "auto" || contentEl.style.height === "") {
                const h = innerEl.getBoundingClientRect().height;
                contentEl.style.height = `${h}px`;
                requestAnimationFrame(() => {
                    contentEl.style.height = "auto";
                });
            } else {
                // If height is px (e.g., quickly toggled), animate to new height
                const h = innerEl.getBoundingClientRect().height;
                animateHeight(h);
            }
        });

        ro.observe(innerEl);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, children]);

    return (
        <div className={"overflow-hidden rounded bg-white border border-gray-200 shadow-sm " + className}>
            {/* Header */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                aria-expanded={open}
                aria-controls={contentId}
                disabled={disabled}
                className={[
                    "flex w-full items-start sm:items-center justify-between gap-3",
                    "px-6 py-3 sm:px-7 lg:px-8",
                    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50",
                    "transition-colors",
                ].join(" ")}
            >
                <div className="flex flex-col gap-1 text-left">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    {description ? <p className="text-sm text-gray-500">{description}</p> : null}
                </div>
                <ChevronDown
                    aria-hidden="true"
                    className={[
                        "mt-1 h-6 w-6 rounded-full text-gray-500 transition-transform duration-300",
                        open ? "rotate-180" : "rotate-0",
                        disabled ? "opacity-60" : "hover:bg-gray-200",
                    ].join(" ")}
                />
            </button>

            {/* Animated content */}
            <div
                id={contentId}
                ref={contentRef}
                className="overflow-hidden will-change-[height]"
                style={{ height: open ? "auto" : 0 }}
            >
                <div ref={innerRef} className="border-t border-gray-200 bg-white px-6 py-3 sm:px-7 md:py-4 lg:py-5 text-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
}
