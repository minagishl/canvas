import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Twemoji } from '~/components/Twemoji';

describe('Twemoji', () => {
  it('renders emoji as an image', () => {
    render(<Twemoji emoji="🎨" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '🎨');
    expect(img).toHaveAttribute(
      'src',
      'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f3a8.svg'
    );
  });

  it('applies custom className', () => {
    render(<Twemoji emoji="🎨" className="custom-class" />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
  });

  it('has draggable false', () => {
    render(<Twemoji emoji="🎨" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('draggable', 'false');
  });
});
