// Extend Jest with DOM-specific assertions such as toBeInTheDocument().
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('react-leaflet', () => {
  const React = require('react');

  return {
    MapContainer: ({ children, ...props }) =>
      React.createElement('div', { 'data-testid': 'map', ...props }, children),
    TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
    Marker: () => React.createElement('div', { 'data-testid': 'map-marker' })
  };
});

jest.mock('socket.io-client', () => () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}));
