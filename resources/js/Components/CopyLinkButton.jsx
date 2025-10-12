import React, { useState } from "react";
import { Share2, Copy } from "lucide-react";
import Button from "@mui/material/Button";

export default function CopyLinkButton({ url }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: "Check this out!", url });
        } else {
            handleCopy();
        }
    };

    return (
        <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2"
        >
            {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
        </Button>
    );
}
