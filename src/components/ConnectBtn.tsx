import React from "react";
import { toast } from "sonner";
import { generateConnectionMessage, encodeMessageForUrl, copyToClipboard } from "@/lib/connection-message";
import { MessageCircle, Instagram, Send as SendIcon } from "lucide-react";

export function ConnectBtn({
  method,
  id,
  active,
  userName,
}: {
  method: "whatsapp" | "instagram" | "telegram";
  id: string;
  active: boolean;
  userName: string;
}) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) return;

    const message = generateConnectionMessage(userName);
    const encodedMessage = encodeMessageForUrl(message);

    if (method === "whatsapp") {
      // WhatsApp: Open with pre-filled message
      const phone = id.replace(/[^\d]/g, "");
      if (!phone) {
        e.preventDefault();
        toast.error("Phone number not available");
        return;
      }
      e.currentTarget.href = `https://wa.me/${phone}?text=${encodedMessage}`;
    } else if (method === "telegram") {
      // Telegram: Try to pre-fill message, otherwise copy to clipboard
      const username = id.replace("@", "");
      if (!username) {
        e.preventDefault();
        toast.error("Telegram username not available");
        return;
      }
      // Telegram supports message prefill via share URL
      e.currentTarget.href = `https://t.me/share/url?url=${encodedMessage}`;
      // Also copy to clipboard as backup
      try {
        await copyToClipboard(message);
        toast.success("Message copied. Paste it into Telegram.");
      } catch (err) {
        console.error("Failed to copy message:", err);
      }
    } else if (method === "instagram") {
      // Instagram: Copy message to clipboard before redirecting
      const username = id.replace("@", "");
      if (!username) {
        e.preventDefault();
        toast.error("Instagram username not available");
        return;
      }
      try {
        await copyToClipboard(message);
        toast.success("Message copied. Paste it into Instagram DM.");
      } catch (err) {
        console.error("Failed to copy message:", err);
        toast.error("Failed to copy message to clipboard");
      }
    }
  };

  const meta = {
    whatsapp: {
      label: "WhatsApp",
      Icon: MessageCircle,
      href: `https://wa.me/${id.replace(/[^\d]/g, "")}`,
    },
    instagram: {
      label: "Instagram",
      Icon: Instagram,
      href: `https://instagram.com/${id.replace("@", "")}`,
    },
    telegram: { label: "Telegram", Icon: SendIcon, href: `https://t.me/${id.replace("@", "")}` },
  }[method];

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium border-border bg-background text-muted-foreground opacity-50 cursor-not-allowed">
        <meta.Icon className="size-4" />
        {meta.label}
      </div>
    );
  }
  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium transition border-primary bg-primary/10 text-primary`}
    >
      <meta.Icon className="size-4" />
      {meta.label}
    </a>
  );
}
