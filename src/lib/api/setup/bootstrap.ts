let _isBootstrapping = true;
let bootstrapPromiseResolve: (() => void) | null = null;

export const bootstrapReady = new Promise<void>((resolve) => {
  bootstrapPromiseResolve = resolve;
});

export function markBootstrapComplete(): void {
  _isBootstrapping = false;
  bootstrapPromiseResolve?.();
}

export function isBootstrapping(): boolean {
  return _isBootstrapping;
}
