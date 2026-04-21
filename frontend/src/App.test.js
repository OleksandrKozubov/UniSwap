import { render, screen } from '@testing-library/react';
import App from './App';

// Placeholder smoke test from Create React App; it should be updated with app-specific checks.
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
