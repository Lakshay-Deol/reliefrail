export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
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
