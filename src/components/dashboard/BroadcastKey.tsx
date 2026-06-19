import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BroadcastKeyProps {
	getShareText: () => string;
	getShareUrl: () => string;
	copied: boolean;
	handleCopyLink: () => Promise<void>;
}

export default function BroadcastKey({
	getShareText,
	getShareUrl,
	copied,
	handleCopyLink,
}: BroadcastKeyProps) {
	const handleOpenShare = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer,width=600,height=540");
	};

	return (
		<section className="w-full max-w-[1180px] mx-auto mt-6 px-6 flex justify-end text-xs text-[#8493AD]">
			{/* Share buttons */}
			<div className="flex items-center gap-2">
				<span className="font-mono text-[10px] tracking-wider text-[#5E6C84] uppercase mr-1">
					Share
				</span>
				<Button
					variant="secondary"
					size="icon"
					onClick={() =>
						handleOpenShare(
							`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`,
						)
					}
					className="size-8 bg-white/3 border border-white/5 hover:border-[#2DE89A]/40 text-[#8493AD] hover:text-white rounded-lg transition-all duration-300"
					title="Share on X"
				>
					<svg className="size-3.5 fill-current" viewBox="0 0 24 24">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
					</svg>
				</Button>
				<Button
					variant="secondary"
					size="icon"
					onClick={() =>
						handleOpenShare(
							`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(getShareText())}`,
						)
					}
					className="size-8 bg-white/3 border border-white/5 hover:border-[#2DE89A]/40 text-[#8493AD] hover:text-white rounded-lg transition-all duration-300"
					title="Share on Facebook"
				>
					<svg className="size-3.5 fill-current" viewBox="0 0 24 24">
						<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
					</svg>
				</Button>
				<Button
					variant="secondary"
					size="icon"
					onClick={() =>
						handleOpenShare(
							`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`,
						)
					}
					className="size-8 bg-white/3 border border-white/5 hover:border-[#2DE89A]/40 text-[#8493AD] hover:text-white rounded-lg transition-all duration-300"
					title="Share on LinkedIn"
				>
					<svg className="size-3.5 fill-current" viewBox="0 0 24 24">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
					</svg>
				</Button>
				<Button
					variant="secondary"
					size="icon"
					onClick={() =>
						handleOpenShare(
							`https://wa.me/?text=${encodeURIComponent(`${getShareText()} ${getShareUrl()}`)}`,
						)
					}
					className="size-8 bg-white/3 border border-white/5 hover:border-[#2DE89A]/40 text-[#8493AD] hover:text-white rounded-lg transition-all duration-300"
					title="Share on WhatsApp"
				>
					<svg className="size-3.5 fill-current" viewBox="0 0 24 24">
						<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.559 1.875 14.09 .843 11.458.841 6.022.841 1.6 5.26 1.597 10.697c-.001 1.703.452 3.369 1.312 4.868l-.993 3.629 3.728-.977zM15.798 13.06c-.324-.162-1.92-.949-2.213-1.055-.293-.106-.507-.162-.72.162-.213.324-.827 1.041-1.013 1.253-.187.213-.373.239-.697.077-.324-.162-1.371-.505-2.61-1.611-.963-.859-1.613-1.92-1.802-2.244-.189-.324-.02-.5-.181-.661-.146-.146-.324-.378-.486-.569-.162-.191-.216-.328-.324-.549-.108-.221-.054-.415-.027-.577.027-.162.213-.51.324-.67.111-.161.162-.272.243-.454.081-.182.041-.341-.02-.503-.06-.162-.507-1.222-.697-1.678-.186-.446-.372-.387-.507-.394-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.602.28-.207.224-.79.772-.79 1.884 0 1.111.81 2.184.92 2.336.111.152 1.593 2.433 3.86 3.41 1.707.732 2.384.818 3.238.692.658-.097 1.92-.786 2.193-1.505.273-.718.273-1.332.192-1.46-.081-.128-.293-.205-.617-.367z" />
					</svg>
				</Button>
				<Button
					variant="secondary"
					size="icon"
					onClick={handleCopyLink}
					className={`size-8 border transition-all duration-300 rounded-lg cursor-pointer ${
						copied
							? "bg-[#2DE89A]/15 border-[#2DE89A]/40 text-[#2DE89A] shadow-[0_0_12px_rgba(45,232,154,0.1)]"
							: "bg-white/3 border border-white/5 hover:border-[#2DE89A]/40 text-[#8493AD] hover:text-white"
					}`}
					title="Copy link"
				>
					{copied ? (
						<Check className="size-3.5" />
					) : (
						<Link2 className="size-3.5" />
					)}
				</Button>
			</div>
		</section>
	);
}
