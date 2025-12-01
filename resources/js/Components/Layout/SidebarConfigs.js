import {
    Home,
    Mail,
    Star,
    MessageSquare,
    BarChart3,
    Building,
    Plus,
    Users,
    Settings,
    FileText,
    Handshake,
    Calendar,
    ListChecks,
    MessageCircle,
    FolderKanban,
} from "lucide-react";
import { router } from "@inertiajs/react";

/* ----------------------- Notification Categorizer ----------------------- */
export function categorizeNotifToPath(n) {
    const link = n?.data?.link || "";

    if (link) {
        const PATHS = {
            chat: "/chat",
            inquiries: "/inquiries",
            trippings: "/trippings",
            deals: "/deals",
            properties: "/properties",
        };

        for (const p of Object.values(PATHS)) {
            if (link.startsWith(p)) return p;
        }
    }

    const title = (n?.data?.title || n?.title || "").toLowerCase();
    const msg = (n?.data?.message || n?.message || "").toLowerCase();
    const text = `${title} ${msg}`;

    if (/(inquiry|lead)\b/.test(text)) return "/inquiries";
    if (/(tripping|visit|site\s*visit|schedule(d)?\s*tripping)\b/.test(text)) return "/trippings";
    if (/(deal|offer|agreement|reservation|closed\s*deal)\b/.test(text)) return "/deals";
    if (/(message|chat|replied|responded)\b/.test(text)) return "/chat";
    if (/(property|listing|new\s*property)\b/.test(text)) return "/properties";

    return null;
}

/* -------------------------- BUYER SIDEBAR -------------------------- */
export const buyerSidebarConfig = {
    appName: "RealSync",
    appDescription: "Buyer Dashboard",
    logo: "/assets/logo.png",
    mainMenus: [
        { name: "Dashboard", Icon: Home, path: "/dashboard", description: "Overview and activity summary" },
        { name: "Messages", Icon: MessageSquare, path: "/chat", description: "Chat with agents & sellers" },
        { name: "Inquiries", Icon: Mail, path: "/inquiries", description: "Your inquiries and leads" },
        { name: "Favourites", Icon: Star, path: "/favourites", description: "Saved & favourite properties" },
        { name: "Trippings", Icon: Calendar, path: "/trippings", description: "Scheduled property visits" },
        { name: "Deals", Icon: Handshake, path: "/deals", description: "Offers, deals & negotiations" },
        { name: "Transactions", Icon: BarChart3, path: "/transactions", description: "Payment & transaction history" },
    ],
    quickActions: [
        { label: "Browse Properties", Icon: Plus, onClick: () => router.get('/properties') }
    ],
    showSearch: false,
    categorizeNotification: categorizeNotifToPath
};

/* -------------------------- SELLER SIDEBAR -------------------------- */
export const sellerSidebarConfig = {
    appName: "RealSync",
    appDescription: "Seller Dashboard",
    logo: "/assets/logo.png",
    mainMenus: [
        { name: "Dashboard", Icon: Home, path: "/seller/dashboard", description: "Seller insights & overview" },
        { name: "My Properties", Icon: Building, path: "/seller/properties", description: "Manage your property listings" },
        { name: "Message", Icon: MessageSquare, path: "/seller/chat", description: "All messages for your Inquiries" },
        { name: "Inquiries", Icon: Mail, path: "/seller/inquiries", description: "Buyer inquiries for your listings" },
    ],
    quickActions: [
        { label: "List Property", Icon: Plus, onClick: () => router.get('/post-property') }
    ],
    showSearch: false,
    categorizeNotification: categorizeNotifToPath
};

/* -------------------------- BROKER SIDEBAR -------------------------- */
export const brokerSidebarConfig = {
    appName: "RealSync",
    appDescription: "Broker Dashboard",
    logo: "/assets/logo.png",
    mainMenus: [
        { name: "Dashboard", Icon: Home, path: "/broker/dashboard", description: "Broker activity overview" },
        { name: "Agent Management", Icon: Users, path: "/broker/agents", description: "Manage agents & assignments" },
        { name: "Properties", Icon: Building, path: "/broker/properties", description: "All property listings" },
        { name: "Inquiries", Icon: Mail, path: "/broker/inquiries", description: "All buyer inquiries" },
        // { name: "Message", Icon: MessageSquare, path: "/broker/chat", description: "All messages for your Inquiries" },
        { name: "Trippings", Icon: Calendar, path: "/broker/trippings", description: "Scheduled property viewings" },
        { name: "Deals", Icon: Handshake, path: "/broker/deals", description: "Offers & deal monitoring" },
        { name: "Transactions", Icon: BarChart3, path: "/broker/transactions", description: "Transaction & payment records" },
        { name: "Partners", Icon: FileText, path: "/broker/partners", description: "View & manage partners" },
    ],
    quickActions: [
        { label: "Post Properties", Icon: Plus, onClick: () => router.get('/broker/properties/create') }
    ],
    showSearch: false,
    categorizeNotification: categorizeNotifToPath
};

/* ----------------------------- AGENT SIDEBAR ----------------------------- */
export const agentSidebarConfig = {
    appName: "RealSync",
    appDescription: "Agent Dashboard",
    logo: "/assets/logo.png",
    mainMenus: [
        { name: "Dashboard", Icon: Home, path: "/agents/dashboard", description: "Agent performance overview" },
        { name: "Properties", Icon: Building, path: "/agents/properties", description: "Listed & assigned properties" },
        { name: "Handle Properties", Icon: Building, path: "/agents/my-listings", description: "All Handle listings" },
        { name: "Inquiries", Icon: Mail, path: "/agents/inquiries", description: "Client inquiries" },
        { name: "Message", Icon: MessageSquare, path: "/agents/chat", description: "All messages for your Inquiries" },
        { name: "Trippings", Icon: Calendar, path: "/agents/trippings", description: "Property tours & schedules" },
        { name: "Deals", Icon: Handshake, path: "/agents/deal", description: "Negotiations & deal tracking" },
        { name: "Transactions", Icon: BarChart3, path: "/agents/transaction", description: "Sales & payment overview" },
        { name: "Feedback", Icon: BarChart3, path: "/agents/feedback", description: "Customer Review" },

    ],
    quickActions: [
        { label: "Add Lead", Icon: Plus, onClick: () => router.get('/agents/properties') }
    ],
    showSearch: false,
    categorizeNotification: categorizeNotifToPath
};

