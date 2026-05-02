type Props = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title = "CordesLab" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="55" cy="104" rx="30" ry="7" fill="rgba(0,0,0,0.10)" />

      <g transform="translate(18,6) rotate(-18 42 52)">
        <path
          d="M34 14
             C34 10, 37 7, 41 7
             H55
             C59 7, 62 10, 62 14
             V62
             C62 78, 55 90, 45 98
             C35 90, 28 78, 28 62
             V14
             Z"
          fill="#F8FAFC"
          stroke="#111827"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        <path
          d="M31 16
             C31 11, 35 7, 40 7
             H56
             C61 7, 65 11, 65 16"
          fill="none"
          stroke="#111827"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <path
          d="M38 16
             V60
             C38 73, 42 83, 46 90"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="gLiquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34D399" stopOpacity="0.95" />
            <stop offset="1" stopColor="#16A34A" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id="clipTube">
            <path
              d="M34 14
                 C34 10, 37 7, 41 7
                 H55
                 C59 7, 62 10, 62 14
                 V62
                 C62 78, 55 90, 45 98
                 C35 90, 28 78, 28 62
                 V14
                 Z"
            />
          </clipPath>
        </defs>

        <g clipPath="url(#clipTube)">
          <path
            d="M26 54
               C34 50, 40 57, 47 54
               C54 51, 58 56, 66 53
               V110
               H26
               Z"
            fill="url(#gLiquid)"
          />

          {Array.from({ length: 10 }).map((_, i) => (
            <path
              key={i}
              d={`M30 ${62 + i * 4} C 38 ${60 + i * 4}, 52 ${66 + i * 4}, 62 ${
                64 + i * 4
              }`}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}

          <circle cx="52" cy="44" r="3" fill="rgba(255,255,255,0.75)" />
          <circle cx="46" cy="38" r="2" fill="rgba(255,255,255,0.65)" />
          <circle cx="56" cy="34" r="2" fill="rgba(255,255,255,0.55)" />
        </g>

        <g transform="translate(28,0)">
          <circle cx="6" cy="10" r="7" fill="#E8FDF2" stroke="#15803D" strokeWidth="2" />
          <circle cx="18" cy="8" r="8" fill="#E8FDF2" stroke="#15803D" strokeWidth="2" />
          <circle cx="30" cy="10" r="7" fill="#E8FDF2" stroke="#15803D" strokeWidth="2" />
        </g>

        <g transform="translate(40,18)">
          <circle cx="6" cy="2" r="2.2" fill="#22C55E" />
          <circle cx="0" cy="8" r="2.2" fill="#22C55E" />
          <circle cx="12" cy="8" r="2.2" fill="#22C55E" />
          <circle cx="6" cy="12" r="2.2" fill="#22C55E" />
          <path
            d="M6 7
               C2.5 7, 1 10, 1.5 12.5
               C2.3 15.7, 9.7 15.7, 10.5 12.5
               C11 10, 9.5 7, 6 7 Z"
            fill="#22C55E"
          />
        </g>
      </g>
    </svg>
  );
}