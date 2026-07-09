"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc magna mi, rhoncus et dolor vel, lobortis pulvinar libero. Fusce ullamcorper quis quam id varius. Phasellus sodales ex vitae est pharetra gravida. Maecenas cursus interdum est, eget vulputate arcu rutrum id. In egestas et purus eu rhoncus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque fringilla turpis tellus, vel ultricies erat convallis quis. Duis malesuada faucibus aliquam. In ut viverra nunc. Integer eget fermentum magna. In blandit lacus non urna fringilla, sed facilisis magna placerat. Nullam vulputate est a lorem placerat, eu viverra nisl dapibus. Nullam quis euismod justo. Praesent id leo at ipsum hendrerit hendrerit eget vitae purus. Suspendisse potenti.",
  "Curabitur sollicitudin orci enim, et vehicula felis maximus non. Nullam finibus vulputate malesuada. In faucibus tortor non velit tristique, in aliquet ligula feugiat. Suspendisse ut arcu at felis blandit interdum non eu ipsum. Proin ullamcorper quis erat ut lobortis. In ligula purus. Vestibulum eget nibh quis magna hendrerit elementum ut ut quam.",
  "Pellentesque sed enim orci. Vestibulum hendrerit pulvinar turpis ultrices pharetra. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque maximus turpis leo, et vulputate purus aliquet at. Phasellus cursus volutpat neque, ac pellentesque leo pretium vitae. Donec accumsan dolor eu varius posuere. Duis interdum justo nec venenatis lobortis. Curabitur condimentum faucibus odio, vitae consectetur massa.",
];

export default function TermsModal({
  open,
  onClose,
  onAgree,
}: {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) setAgreed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Terms and Conditions"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Terms and Conditions</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="space-y-4 rounded-xl border border-slate-200 p-5 text-sm leading-relaxed text-slate-600">
            {PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
            />
            I agree to the terms &amp; conditions
          </label>
          <button
            type="button"
            disabled={!agreed}
            onClick={onAgree}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-mid disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
