interface StorageNoticeProps {
  readonly message: string;
  readonly onDismiss: () => void;
}

export function StorageNotice({ message, onDismiss }: StorageNoticeProps) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-900">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 rounded px-2 py-0.5 font-medium hover:bg-amber-100">
        Dismiss
      </button>
    </div>
  );
}
