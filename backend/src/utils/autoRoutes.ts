import { FastifyInstance } from 'fastify';
import { promises as fsp } from 'fs';
import path from 'path';

export async function registerRoutesFromDir(fastify: FastifyInstance, routesDir = path.join(process.cwd(), 'src', 'routes')) {
  const entries = await fsp.readdir(routesDir, { withFileTypes: true });

  for (const entry of entries) {
    const name = entry.name;
    
    // Skip test files and non-route files
    if (name.endsWith('.test.ts') || name.endsWith('.test.js')) continue;
    if (name === 'index.ts' || name === 'index.js') continue;

    let mod: any;
    let prefix: string;

    if (entry.isDirectory()) {
      // For directories, try to import from index.ts or find a .route.ts file
      const dirPath = path.join(routesDir, name);
      const dirEntries = await fsp.readdir(dirPath);
      
      // First try index.ts/index.js
      if (dirEntries.includes('index.ts') || dirEntries.includes('index.js')) {
        mod = await import(`../routes/${name}/index`);
      } else {
        // Look for a .route.ts file or a file matching the directory name
        const routeFile = dirEntries.find(f => 
          f.endsWith('.route.ts') || f.endsWith('.route.js') ||
          f === `${name}.ts` || f === `${name}.js`
        );
        if (routeFile) {
          const routeFileName = path.basename(routeFile, path.extname(routeFile));
          mod = await import(`../routes/${name}/${routeFileName}`);
        } else {
          continue; // No valid route file found
        }
      }
      prefix = `/${name}`;
    } else if (name.endsWith('.ts') || name.endsWith('.js')) {
      // Handle files directly in routes folder
      const baseName = path.basename(name, path.extname(name));
      mod = await import(`../routes/${baseName}`);
      prefix = `/${baseName}`;
    } else {
      continue;
    }

    // Prefer exported functions whose name ends with 'Routes' (case-insensitive)
    let routeFn: any = null;
    for (const key of Object.keys(mod)) {
      if (typeof (mod as any)[key] === 'function' && key.toLowerCase().endsWith('routes')) {
        routeFn = (mod as any)[key];
        break;
      }
    }

    // Fallback to default export if it's a function
    if (!routeFn && typeof mod.default === 'function') {
      routeFn = mod.default;
    }

    if (!routeFn) {
      // nothing to register for this module
      continue;
    }

    // Register the route plugin with the prefix derived from the filename
    if(prefix) {
        await fastify.register(routeFn, { prefix });
    }
  }
}

export default registerRoutesFromDir;
