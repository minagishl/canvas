interface TwemojiProps {
  emoji: string;
  className?: string;
}

export function Twemoji({
  emoji,
  className = '',
}: TwemojiProps): React.ReactElement {
  // Convert emoji to its hex code
  const codePoint = emoji.codePointAt(0)?.toString(16);

  return (
    <img
      src={`https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codePoint}.svg`}
      alt={emoji}
      className={`inline-block h-4 w-4 align-text-bottom ${className}`}
      draggable={false}
    />
  );
}
