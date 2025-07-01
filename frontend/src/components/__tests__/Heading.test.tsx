import { render, screen } from '@testing-library/react';
import { Heading } from '@/components/ui/heading';

describe('Heading Component', () => {
  it('renders heading with correct text', () => {
    render(<Heading>Test Heading</Heading>);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('applies the correct HTML tag based on level prop', () => {
    render(<Heading level={2}>H2 Heading</Heading>);
    const heading = screen.getByText('H2 Heading');
    expect(heading.tagName.toLowerCase()).toBe('h2');
  });

  it('applies custom className when provided', () => {
    render(<Heading className="custom-class">Custom Heading</Heading>);
    const heading = screen.getByText('Custom Heading');
    expect(heading).toHaveClass('custom-class');
  });
}); 