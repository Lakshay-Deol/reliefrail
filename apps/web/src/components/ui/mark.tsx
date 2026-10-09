/** ReliefRail mark: hex outline + airdrop arrow matching browser tab icon */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none">
      <rect width="24" height="24" rx="6" fill="#070b14" />
      <path
        d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9z"
        fill="none"
        stroke="#4edea3"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v10M8 11.5l4 4 4-4"
        fill="none"
        stroke="#dae2fd"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ subtitle, compact }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark />
      <span className="text-base font-bold tracking-tight text-[#dae2fd]">ReliefRail</span>
      {subtitle && !compact && (
        <span className="hidden text-xs text-[#86948a] lg:inline">{subtitle}</span>
      )}
    </div>
  );
}
