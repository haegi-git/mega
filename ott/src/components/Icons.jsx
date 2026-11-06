const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const PlayIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
);
export const PauseIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
);
export const PlusIcon = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const CheckIcon = (p) => (<svg {...base} {...p}><path d="M20 6 9 17l-5-5" /></svg>);
export const SearchIcon = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const ChevronLeft = (p) => (<svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>);
export const ChevronRight = (p) => (<svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>);
export const InfoIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>);
export const ShareIcon = (p) => (<svg {...base} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const VolumeIcon = (p) => (<svg {...base} {...p}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>);
export const MuteIcon = (p) => (<svg {...base} {...p}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6M17 9l6 6" /></svg>);
export const FullscreenIcon = (p) => (<svg {...base} {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>);
export const Back10Icon = (p) => (<svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">10</text></svg>);
export const Fwd10Icon = (p) => (<svg {...base} {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /><text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">10</text></svg>);
export const NextIcon = (p) => (<svg {...base} {...p} fill="currentColor" stroke="none"><path d="M5 4.5v15a1 1 0 0 0 1.5.86L17 13.5V19h2V5h-2v5.5L6.5 3.64A1 1 0 0 0 5 4.5z" /></svg>);
export const UserIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const HeartIcon = ({ filled, ...p }) => (<svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>);
export const ChatIcon = (p) => (<svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z" /></svg>);
export const BellIcon = ({ filled, ...p }) => (<svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>);
export const EyeIcon = (p) => (<svg {...base} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>);
export const MusicIcon = (p) => (<svg {...base} {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>);
export const LockIcon = (p) => (<svg {...base} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
export const SendIcon = (p) => (<svg {...base} {...p}><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>);
export const SparkIcon = (p) => (<svg {...base} {...p} fill="currentColor" stroke="none"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" /></svg>);
export const TrashIcon =(p) => (<svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>);
