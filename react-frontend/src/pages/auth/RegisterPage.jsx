import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { colors, withAlpha } from '@/utils/theme';

export const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="card-base w-full max-w-md p-8 text-center">
        <span
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: withAlpha(colors.primary, 0.12) }}
        >
          <UserPlus size={32} color={colors.primary} />
        </span>
        <h1 className="text-2xl font-bold text-ink">Self-service signup</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          New accounts are created by an administrator from the Management
          panel. Ask your manager to create an account, then sign in here.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">
          Back to login
        </Link>
      </div>
    </div>
  );
};
