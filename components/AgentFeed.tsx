export default function AgentFeed({ nudges }: { nudges: any[] }) {
  return (
    <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl p-4 space-y-3">
      {nudges.map((n) => {
        const toneColors = ["#8B7355", "#8B7355", "#F2A623", "#F2A623", "#E8593C", "#E8593C"];
        const toneColor = toneColors[n.tone_level || 1];
        const user = Array.isArray(n.users) ? n.users[0] : n.users;
        return (
          <div key={n.id} className="pl-3 border-l-2" style={{ borderColor: toneColor }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span className="text-base">{user?.emoji}</span>
                {user?.name} · <span className="text-[#8B7355] font-medium">nudge {n.channel}</span>
              </div>
              <div className="text-[9px] text-[#8B7355]">{new Date(n.sent_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</div>
            </div>
            <div className="text-xs italic text-[#D4CFC7] leading-relaxed">"{n.message}"</div>
            {n.responded_at && (
              <div className="text-[10px] text-sage font-bold mt-1.5">✓ replied {new Date(n.responded_at).toLocaleString("en-AU", { hour: "numeric", minute: "2-digit" })}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
