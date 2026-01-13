// Render shim for backward compatibility
// If Render tries to run 'node server.js' from root, this redirects it to the correct location.
require('./backend/server.js');
