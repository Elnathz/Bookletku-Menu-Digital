import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Share2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function QRCodeDisplay({ value, size = 200, showActions = true }) {
    const { t } = useLanguage();

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = size * 2;
            canvas.height = size * 2;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "menu-qrcode.png";
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(value);
            alert(t.linkCopied);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const shareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Menu Digital",
                    url: value,
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error sharing:", err);
                }
            }
        } else {
            copyLink();
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* QR Code */}
            <div className="p-4 bg-white rounded-xl border shadow-sm">
                <QRCodeSVG
                    id="qr-code-svg"
                    value={value}
                    size={size}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            </div>

            {/* Link display */}
            <p className="mt-3 text-xs text-gray-500 text-center break-all max-w-[250px]">
                {value}
            </p>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={downloadQR}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download size={16} />
                        Download
                    </button>
                    <button
                        onClick={copyLink}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Copy size={16} />
                        {t.copyLink}
                    </button>
                    <button
                        onClick={shareLink}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            )}
        </div>
    );
}

export default QRCodeDisplay;
