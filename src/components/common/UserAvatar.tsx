import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface UserAvatarProps {
  user?: Partial<User> | null;
  className?: string;
  showStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  className = 'w-8 h-8 rounded-lg',
  showStatus = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const name = user?.name || 'User';
  const avatarUrl = user?.avatar;

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  // Extract initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative inline-block shrink-0">
      {avatarUrl && !imgError ? (
        <img
          key={avatarUrl}
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${className} object-cover ring-1 ring-amber-400/50 shadow-md`}
        />
      ) : (
        <div
          className={`${className} bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-zinc-950 font-black flex items-center justify-center ring-1 ring-amber-300/50 shadow-md uppercase tracking-wider text-xs select-none`}
        >
          {initials || <UserIcon className="w-4 h-4 text-zinc-950" />}
        </div>
      )}

      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
      )}
    </div>
  );
};
