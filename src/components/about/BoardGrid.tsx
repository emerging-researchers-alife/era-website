import { BoardMemberCard, type BoardMember } from './BoardMemberCard';

interface BoardGridProps {
  title: string;
  members: BoardMember[];
}

export function BoardGrid({ title, members }: BoardGridProps) {
  return (
    <section className="mt-12">
      <h3
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member) => (
          <BoardMemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}
