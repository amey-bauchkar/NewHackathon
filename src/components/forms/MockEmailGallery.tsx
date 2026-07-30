"use client";

import { mockOffers } from "@/lib/mockOffers";
import { useOfferStore } from "@/store/offerStore";

export default function MockEmailGallery() {
  const setInputText = useOfferStore((s) => s.setInputText);

  const tagStyles = {
    scam: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    suspicious: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
    safe: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-muted mb-3">
        Try with example offers:
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {mockOffers.map((offer) => {
          const style = tagStyles[offer.tag];
          return (
            <button
              key={offer.id}
              onClick={() => setInputText(offer.text)}
              className={`text-left p-4 rounded-xl border ${style.border} ${style.bg} hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground group-hover:underline">
                  {offer.title}
                </span>
              </div>
              <p className={`text-xs ${style.text} line-clamp-2`}>
                {offer.preview}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
