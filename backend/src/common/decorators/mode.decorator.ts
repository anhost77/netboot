import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the app mode (real/simulation) from request headers
 * Usage: @Mode() mode: string
 */
export const Mode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const mode = request.headers['x-app-mode'];
    
    // Validate mode value
    if (mode && (mode === 'real' || mode === 'simulation')) {
      return mode;
    }
    
    // Default to 'real' if not specified or invalid
    return 'real';
  },
);
