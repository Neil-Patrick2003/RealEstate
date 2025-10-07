export function buildSidebarCounts(unreads = []) {
    // define the routes used in your sidebar
    const counts = {
        "/chat": 0,
        "/inquiries": 0,
        "/trippings": 0,
        "/deals": 0,
    };

    // loop through every unread notification
    for (const n of unreads) {
        const title = (n?.data?.title || "").toLowerCase();
        const msg = (n?.data?.message || "").toLowerCase();
        const link = n?.data?.link || "";

        // priority 1 — use link if it matches a sidebar path
        if (link.includes("/inquiries")) {
            counts["/inquiries"]++;
            continue;
        }
        if (link.includes("/chat")) {
            counts["/chat"]++;
            continue;
        }
        if (link.includes("/trippings")) {
            counts["/trippings"]++;
            continue;
        }
        if (link.includes("/deals")) {
            counts["/deals"]++;
            continue;
        }

        // priority 2 — detect keywords in title/message
        if (title.includes("inquiry") || msg.includes("inquiry")) {
            counts["/inquiries"]++;
        } else if (title.includes("tripping") || msg.includes("tripping")) {
            counts["/trippings"]++;
        } else if (title.includes("deal") || msg.includes("deal")) {
            counts["/deals"]++;
        } else if (title.includes("message") || msg.includes("message")) {
            counts["/chat"]++;
        }
    }

    return counts;
}
