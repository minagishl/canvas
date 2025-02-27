import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReleaseNotes } from '~/components/ReleaseNotes';

describe('Release Notes', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    vi.clearAllMocks();
  });

  it('shows release notes on first visit', () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    render(<ReleaseNotes />);

    expect(screen.getByText('Release Notes')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Canvas!/)).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'release-notes-seen',
      'true'
    );
  });

  it('does not show release notes on subsequent visits', () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue('true');
    render(<ReleaseNotes />);

    expect(screen.queryByText('Release Notes')).not.toBeInTheDocument();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('closes release notes when clicking overlay', async () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    render(<ReleaseNotes />);

    expect(screen.getByText('Release Notes')).toBeInTheDocument();

    const overlay = screen.getByRole('release-notes');
    await userEvent.click(overlay);

    expect(screen.queryByText('Release Notes')).not.toBeInTheDocument();
  });

  it('renders all feature sections with Twemoji icons', () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    render(<ReleaseNotes />);

    const sections = [
      { text: 'Core Creative Tools', emoji: '🎨' },
      { text: 'Enhanced Media Features', emoji: '✨' },
      { text: 'Canvas AI Integration', emoji: '🤖' },
      { text: 'Global Accessibility', emoji: '🌏' },
    ];

    sections.forEach(({ text, emoji }) => {
      const heading = screen.getByText(text);
      expect(heading).toBeInTheDocument();

      const emojiImg = heading.parentElement?.querySelector('img');
      expect(emojiImg).toHaveAttribute('alt', emoji);
    });
  });

  it('renders version number', () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    render(<ReleaseNotes />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});
