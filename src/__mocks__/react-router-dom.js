// Manual mock for react-router-dom
const React = require('react');

// Pass-through exports for Router components that tests need
const MemoryRouter = ({ children }) => React.createElement('div', { 'data-testid': 'memory-router' }, children);
const Routes = ({ children }) => React.createElement('div', { 'data-testid': 'routes' }, children);
const Route = ({ element }) => element;
const Navigate = ({ to, replace }) => React.createElement('div', { 'data-testid': 'navigate', 'data-to': to });

module.exports = {
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/" }),
  Link: ({ children, to }) => children,
  BrowserRouter: ({ children }) => children,
  MemoryRouter,
  Routes,
  Route,
  Navigate,
};
