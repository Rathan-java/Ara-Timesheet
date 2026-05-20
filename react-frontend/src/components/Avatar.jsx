import { withAlpha, colors } from '@/utils/theme';

export const Avatar = ({ name, size = 32, url }) => {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = name?.[0]?.toUpperCase() ?? '?';
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.42),
        backgroundColor: withAlpha(colors.primary, 0.15),
        color: colors.primary,
      }}
    >
      {initial}
    </span>
  );
};
