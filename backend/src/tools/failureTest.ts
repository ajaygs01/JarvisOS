import type { FailureTestOutput } from '../types/agent.js';

export interface FailureTestParams {
  mode: 'transient_recovery' | 'permanent_failure';
  attemptNumber?: number;
  customMessage?: string;
}

export async function executeFailureTest(params: FailureTestParams): Promise<FailureTestOutput> {
  const mode = params.mode || 'transient_recovery';
  const attempt = params.attemptNumber ?? 0;

  console.log(`[failureTest] Executing in mode: ${mode}, attempt: ${attempt}`);

  if (mode === 'transient_recovery') {
    // Fails on attempt 0 and 1, then succeeds on attempt 2 to demonstrate auto-retry recovery!
    if (attempt < 2) {
      throw new Error(
        `[SIMULATED_TRANSIENT_FAILURE] Attempt #${attempt + 1}: Upstream service simulated gateway timeout (HTTP 504). Transient network disruption detected.`
      );
    }

    // Attempt 2 succeeds:
    return {
      mode,
      attemptNumber: attempt,
      simulatedError: 'HTTP 504 Gateway Timeout (Simulated)',
      recovered: true,
      message: `Self-healing auto-retry succeeded on attempt #${attempt + 1}! Service recovered and output verified.`,
    };
  }

  // Permanent failure mode: always fails to demonstrate unrecoverable error handling
  throw new Error(
    `[SIMULATED_UNRECOVERABLE_FAILURE] Attempt #${attempt + 1}: Target subsystem rejected request. Failure is permanent and cannot be safely retried.`
  );
}
