import { useState } from "react";

export function useShare(team: string) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    if (team) return `⚽ Every ${team} match at the 2026 World Cup — kickoff times and TV channels, all on one screen 👇 #WorldCup2026`;
    return `⚽ The whole 2026 World Cup on one screen — every kickoff time and TV channel for all 104 matches. Don't miss a goal 👇 #WorldCup2026`;
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined" && window.location.protocol.startsWith("http")) {
      return window.location.origin + window.location.pathname.replace(/index\.html$/, "");
    }
    return "https://github.com/shatch/world-cup-2026-dashboard";
  };

  const handleCopyLink = async () => {
    const textAndUrl = `${getShareText()} ${getShareUrl()}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "World Cup 2026 Schedule & TV Channels",
          text: getShareText(),
          url: getShareUrl(),
        });
        return;
      }
      await navigator.clipboard.writeText(textAndUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Ignore abort errors
    }
  };

  return { copied, handleCopyLink, getShareText, getShareUrl };
}
