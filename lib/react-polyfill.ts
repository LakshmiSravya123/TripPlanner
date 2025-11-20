// Polyfill for unstable_act to fix react-three-fiber compatibility with React 18.3
// This needs to run before any react-three-fiber imports

if (typeof window !== 'undefined') {
  // @ts-ignore
  const React = require('react');
  if (React && !React.unstable_act) {
    // Use act if available, otherwise create a no-op function
    // @ts-ignore
    React.unstable_act = React.act || ((fn: () => void) => {
      try {
        if (typeof fn === 'function') {
          fn();
        }
      } catch (e) {
        // Silently ignore errors in polyfill
      }
    });
  }
}

