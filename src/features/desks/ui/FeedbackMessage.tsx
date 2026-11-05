export interface Feedback {
  readonly tone: "success" | "error";
  readonly message: string;
}

interface FeedbackMessageProps {
  readonly feedback: Feedback;
  readonly onDismiss: () => void;
}

const TONE_CLASSES: Readonly<Record<Feedback["tone"], string>> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

export function FeedbackMessage({ feedback, onDismiss }: FeedbackMessageProps) {
  return (
    <div
      role={feedback.tone === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${TONE_CLASSES[feedback.tone]}`}
    >
      <span>{feedback.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="-my-0.5 shrink-0 rounded px-1.5 text-base leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
