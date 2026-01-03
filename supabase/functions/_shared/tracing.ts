/**
 * Distributed Tracing Module
 *
 * W3C Trace Context compliant distributed tracing for Edge Functions.
 * Enables request correlation across multiple edge functions and services.
 *
 * Features:
 * - W3C Trace Context (traceparent, tracestate)
 * - Span creation and management
 * - Automatic propagation headers
 * - Performance timing
 * - Error tracking with trace context
 *
 * @see https://www.w3.org/TR/trace-context/
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TraceContext {
  traceId: string;      // 32 hex chars (16 bytes)
  spanId: string;       // 16 hex chars (8 bytes)
  parentSpanId?: string;
  sampled: boolean;
  traceState?: Map<string, string>;
}

export interface Span {
  spanId: string;
  name: string;
  traceId: string;
  parentSpanId?: string;
  startTime: number;
  endTime?: number;
  status: 'ok' | 'error' | 'unset';
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

// =============================================================================
// TRACE ID GENERATION
// =============================================================================

/**
 * Generate a random trace ID (32 hex chars = 16 bytes)
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random span ID (16 hex chars = 8 bytes)
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================================================
// W3C TRACE CONTEXT PARSING
// =============================================================================

/**
 * Parse W3C traceparent header
 * Format: version-traceId-spanId-flags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
export function parseTraceparent(header: string): TraceContext | null {
  const regex = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
  const match = header.match(regex);

  if (!match) return null;

  const [, version, traceId, spanId, flags] = match;

  // Version 00 is currently supported
  if (version !== '00') return null;

  return {
    traceId,
    spanId,
    parentSpanId: spanId, // The incoming spanId becomes our parent
    sampled: (parseInt(flags, 16) & 0x01) === 1,
  };
}

/**
 * Format trace context as W3C traceparent header
 */
export function formatTraceparent(ctx: TraceContext): string {
  const flags = ctx.sampled ? '01' : '00';
  return `00-${ctx.traceId}-${ctx.spanId}-${flags}`;
}

/**
 * Parse W3C tracestate header
 * Format: vendor1=value1,vendor2=value2
 */
export function parseTracestate(header: string): Map<string, string> {
  const state = new Map<string, string>();

  header.split(',').forEach(entry => {
    const [key, value] = entry.trim().split('=');
    if (key && value) {
      state.set(key, value);
    }
  });

  return state;
}

/**
 * Format tracestate map as header value
 */
export function formatTracestate(state: Map<string, string>): string {
  return Array.from(state.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
}

// =============================================================================
// TRACER CLASS
// =============================================================================

export class Tracer {
  private context: TraceContext;
  private spans: Map<string, Span> = new Map();
  private currentSpanId: string;
  private serviceName: string;

  constructor(serviceName: string, request?: Request) {
    this.serviceName = serviceName;

    // Extract or create trace context
    if (request) {
      const traceparent = request.headers.get('traceparent');
      if (traceparent) {
        const parsed = parseTraceparent(traceparent);
        if (parsed) {
          this.context = {
            ...parsed,
            spanId: generateSpanId(), // New span for this function
            parentSpanId: parsed.spanId,
          };

          // Parse tracestate if present
          const tracestate = request.headers.get('tracestate');
          if (tracestate) {
            this.context.traceState = parseTracestate(tracestate);
          }
        } else {
          this.context = this.createNewContext();
        }
      } else {
        this.context = this.createNewContext();
      }
    } else {
      this.context = this.createNewContext();
    }

    this.currentSpanId = this.context.spanId;

    // Create root span for this service
    this.startSpan(`${serviceName}.request`);
  }

  private createNewContext(): TraceContext {
    return {
      traceId: generateTraceId(),
      spanId: generateSpanId(),
      sampled: true, // Sample all traces for now
    };
  }

  // =============================================================================
  // SPAN MANAGEMENT
  // =============================================================================

  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): string {
    const spanId = generateSpanId();
    const parentSpanId = this.currentSpanId;

    const span: Span = {
      spanId,
      name,
      traceId: this.context.traceId,
      parentSpanId,
      startTime: performance.now(),
      status: 'unset',
      attributes: {
        'service.name': this.serviceName,
        ...attributes,
      },
      events: [],
    };

    this.spans.set(spanId, span);
    this.currentSpanId = spanId;

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok'): Span | undefined {
    const span = this.spans.get(spanId);
    if (!span) return undefined;

    span.endTime = performance.now();
    span.status = status;

    // Restore parent as current
    if (span.parentSpanId) {
      this.currentSpanId = span.parentSpanId;
    }

    return span;
  }

  /**
   * Add event to current span
   */
  addEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
    const span = this.spans.get(this.currentSpanId);
    if (!span) return;

    span.events.push({
      name,
      timestamp: performance.now(),
      attributes,
    });
  }

  /**
   * Set attribute on current span
   */
  setAttribute(key: string, value: string | number | boolean): void {
    const span = this.spans.get(this.currentSpanId);
    if (!span) return;

    span.attributes[key] = value;
  }

  /**
   * Record exception on current span
   */
  recordException(error: Error): void {
    const span = this.spans.get(this.currentSpanId);
    if (!span) return;

    span.status = 'error';
    span.events.push({
      name: 'exception',
      timestamp: performance.now(),
      attributes: {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack || '',
      },
    });
  }

  // =============================================================================
  // CONTEXT PROPAGATION
  // =============================================================================

  /**
   * Get headers for propagating trace context to downstream services
   */
  getPropagationHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'traceparent': formatTraceparent({
        ...this.context,
        spanId: this.currentSpanId,
      }),
    };

    if (this.context.traceState && this.context.traceState.size > 0) {
      headers['tracestate'] = formatTracestate(this.context.traceState);
    }

    // Also include custom headers for easier debugging
    headers['x-trace-id'] = this.context.traceId;
    headers['x-span-id'] = this.currentSpanId;

    return headers;
  }

  /**
   * Get trace ID
   */
  getTraceId(): string {
    return this.context.traceId;
  }

  /**
   * Get current span ID
   */
  getCurrentSpanId(): string {
    return this.currentSpanId;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Wrap an async function with span tracking
   */
  async trace<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    const spanId = this.startSpan(name, attributes);

    try {
      const result = await fn();
      this.endSpan(spanId, 'ok');
      return result;
    } catch (error) {
      this.recordException(error as Error);
      this.endSpan(spanId, 'error');
      throw error;
    }
  }

  /**
   * Get all completed spans for logging/export
   */
  getSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  /**
   * Get trace summary for logging
   */
  getSummary(): {
    traceId: string;
    totalSpans: number;
    totalDurationMs: number;
    errors: number;
  } {
    const spans = Array.from(this.spans.values());
    const errors = spans.filter(s => s.status === 'error').length;

    const rootSpan = spans.find(s => !s.parentSpanId || s.parentSpanId === this.context.parentSpanId);
    const totalDuration = rootSpan?.endTime
      ? rootSpan.endTime - rootSpan.startTime
      : performance.now() - (rootSpan?.startTime || 0);

    return {
      traceId: this.context.traceId,
      totalSpans: spans.length,
      totalDurationMs: Math.round(totalDuration * 100) / 100,
      errors,
    };
  }

  /**
   * End all spans and log summary
   */
  finish(): void {
    // End all open spans
    for (const [spanId, span] of this.spans) {
      if (!span.endTime) {
        this.endSpan(spanId);
      }
    }

    // Log trace summary in production-friendly format
    const summary = this.getSummary();
    console.log(JSON.stringify({
      type: 'trace',
      ...summary,
      spans: this.getSpans().map(s => ({
        name: s.name,
        durationMs: s.endTime ? Math.round((s.endTime - s.startTime) * 100) / 100 : null,
        status: s.status,
        events: s.events.length,
      })),
    }));
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a tracer for an Edge Function
 */
export function createTracer(functionName: string, request?: Request): Tracer {
  return new Tracer(`edge-${functionName}`, request);
}

// =============================================================================
// RESPONSE HELPER
// =============================================================================

/**
 * Add trace headers to a response
 */
export function addTraceHeaders(response: Response, tracer: Tracer): Response {
  const headers = new Headers(response.headers);
  headers.set('x-trace-id', tracer.getTraceId());
  headers.set('x-span-id', tracer.getCurrentSpanId());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
