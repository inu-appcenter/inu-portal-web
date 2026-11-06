import { ComponentType, FC, ReactElement } from "react";
import { lazyWithRetry } from "./lazyWithRetry";
import { shouldSkipPrefetch } from "./prefetch";

export type PreloadableComponent<P extends object = Record<string, unknown>> = FC<P> & {
  preload: () => Promise<ComponentType<P> | null>;
};

/**
 * 사전 로드가 완료된 컴포넌트는 React.lazy를 거치지 않고 동기 컴포넌트로 즉시 렌더링하여
 * Suspense fallback(스피너 깜빡임)을 완전히 방지하는 고성능 지연 로딩 래퍼
 */
export function preloadableLazy<P extends object = Record<string, unknown>>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): PreloadableComponent<P> {
  let resolvedComponent: ComponentType<P> | null = null;
  let loadingPromise: Promise<ComponentType<P> | null> | null = null;

  const preload = (): Promise<ComponentType<P> | null> => {
    if (resolvedComponent) {
      return Promise.resolve(resolvedComponent);
    }

    if (shouldSkipPrefetch()) {
      return Promise.resolve(null);
    }

    if (!loadingPromise) {
      loadingPromise = factory()
        .then((module) => {
          resolvedComponent = module.default;
          return resolvedComponent;
        })
        .catch((error) => {
          loadingPromise = null;
          throw error;
        });
    }

    return loadingPromise;
  };

  const LazyFallback = lazyWithRetry(factory) as unknown as ComponentType<P>;

  const Preloadable: FC<P> = (props): ReactElement | null => {
    if (resolvedComponent) {
      const Comp = resolvedComponent;
      return <Comp {...props} />;
    }
    return <LazyFallback {...props} />;
  };

  const result = Preloadable as PreloadableComponent<P>;
  result.preload = preload;

  return result;
}
