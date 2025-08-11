import { getAccount, getFollowersCount } from '@/lib/api';

export default async function ChannelAbout({ params }: { params: { handle: string } }) {
  const user = params.handle.replace(/^@/, '');
  const [account, followers] = await Promise.all([
    getAccount(user),
    getFollowersCount(user),
  ]);

  const data = (account as any)?.json?.profile || {};
  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-card rounded-2xl p-4">
        <h1 className="text-xl font-semibold">@{user}</h1>
        <p className="text-neutral-300 mt-2 whitespace-pre-wrap">
          {data.about || 'No description yet.'}
        </p>
      </div>

      <div className="bg-card rounded-2xl p-4">
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-300">
          <div><span className="text-neutral-400">Website:</span> {data.website || '—'}</div>
          <div><span className="text-neutral-400">Location:</span> {data.location || '—'}</div>
          <div><span className="text-neutral-400">Followers:</span> {followers}</div>
          <div><span className="text-neutral-400">Joined:</span> {new Date(((account as any)?.created || Date.now())).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
