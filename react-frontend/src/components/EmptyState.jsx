import { Inbox } from 'lucide-react';

export const EmptyState = ({ title, description, icon: Icon = Inbox, action }) => {
  return (
    <div className="card-base flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon size={36} className="text-ink-light/60" />
      <p className="text-sm font-semibold text-ink-secondary">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-ink-light">{description}</p>
      )}
      {action}
    </div>
  );
};
