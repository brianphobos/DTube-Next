import Link from 'next/link';
import FollowButton from './FollowButton';

export default function ChannelHeader({ account }: { account: any }) {
  const username = account?.name || account?.username || 'unknown';
  const about = account?.json?.profile?.about || '';
  const avatar =
    account?.json?.profile?.avatar ||
    `https://cdn.statically.io/gh/identicons/${encodeURIComponent(username)}/avatar`;

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6">
      <div className="flex items-center gap-4">
        <img src={avatar} alt={username} className="w-20 h-20 rounded-full object-cover" />
        <div className="flex-1">
          <div className="text-xl font-semibold">@{username}</div>
          <p className="text-sm text-neutral-300 mt-1 line-clamp-2">{about}</p>
          <div className="mt-3 flex items-center gap-3">
            <FollowButton username={username} />
            <Link href={`/@${username}?tab=about`} className="text-sm text-neutral-300 hover:underline">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
