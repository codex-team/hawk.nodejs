import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BreadcrumbManager } from '../src/modules/breadcrumbs.js';
import type { Breadcrumb } from '@hawk.so/types';

/**
 * BreadcrumbManager is a singleton with isInitialized guard.
 * We need a fresh instance per test, so we reset the static field.
 */
function resetManager(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BreadcrumbManager as any).instance = null;
}

describe('BreadcrumbManager', () => {
  beforeEach(() => {
    resetManager();
  });

  it('returns empty array before any breadcrumbs added', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();
    expect(manager.getBreadcrumbs()).toEqual([]);
  });

  it('adds a breadcrumb with auto-generated timestamp', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();
    manager.addBreadcrumb({ type: 'debug', message: 'test', level: 'info' });

    const crumbs = manager.getBreadcrumbs();

    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].message).toBe('test');
    expect(crumbs[0].timestamp).toBeTypeOf('number');
  });

  it('preserves explicit timestamp', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();
    manager.addBreadcrumb({ type: 'debug', message: 'test', level: 'info', timestamp: 12345 });

    expect(manager.getBreadcrumbs()[0].timestamp).toBe(12345);
  });

  it('respects maxBreadcrumbs (FIFO)', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init({ maxBreadcrumbs: 3 });

    for (let i = 0; i < 5; i++) {
      manager.addBreadcrumb({ type: 'debug', message: `msg-${i}`, level: 'info' });
    }

    const crumbs = manager.getBreadcrumbs();

    expect(crumbs).toHaveLength(3);
    expect(crumbs[0].message).toBe('msg-2');
    expect(crumbs[1].message).toBe('msg-3');
    expect(crumbs[2].message).toBe('msg-4');
  });

  it('uses default maxBreadcrumbs of 15', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();

    for (let i = 0; i < 20; i++) {
      manager.addBreadcrumb({ type: 'debug', message: `msg-${i}`, level: 'info' });
    }

    expect(manager.getBreadcrumbs()).toHaveLength(15);
  });

  it('clear() empties the buffer', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();
    manager.addBreadcrumb({ type: 'debug', message: 'test', level: 'info' });
    manager.clear();

    expect(manager.getBreadcrumbs()).toEqual([]);
  });

  it('getBreadcrumbs returns a copy, not the internal array', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init();
    manager.addBreadcrumb({ type: 'debug', message: 'test', level: 'info' });

    const crumbs = manager.getBreadcrumbs();

    crumbs.push({ type: 'debug', message: 'injected', level: 'info', timestamp: 0 } as Breadcrumb);

    expect(manager.getBreadcrumbs()).toHaveLength(1);
  });

  describe('beforeBreadcrumb', () => {
    it('discards breadcrumb when hook returns false', () => {
      const manager = BreadcrumbManager.getInstance();

      manager.init({
        beforeBreadcrumb: () => false,
      });

      manager.addBreadcrumb({ type: 'debug', message: 'test', level: 'info' });

      expect(manager.getBreadcrumbs()).toHaveLength(0);
    });

    it('stores original breadcrumb and warns when hook returns null', () => {
      const manager = BreadcrumbManager.getInstance();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeBreadcrumb: () => null as any,
      });

      manager.addBreadcrumb({ type: 'debug', message: 'kept', level: 'info' });

      const crumbs = manager.getBreadcrumbs();

      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].message).toBe('kept');
      expect(warnSpy).toHaveBeenCalledWith('[Hawk] beforeBreadcrumb returned nothing, storing original breadcrumb.');
      warnSpy.mockRestore();
    });

    it('allows modifying breadcrumb in hook', () => {
      const manager = BreadcrumbManager.getInstance();

      manager.init({
        beforeBreadcrumb: (bc) => {
          bc.message = 'modified';

          return bc;
        },
      });

      manager.addBreadcrumb({ type: 'debug', message: 'original', level: 'info' });

      expect(manager.getBreadcrumbs()[0].message).toBe('modified');
    });

    it('stores original breadcrumb and warns when hook returns undefined (no return)', () => {
      const manager = BreadcrumbManager.getInstance();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeBreadcrumb: () => undefined as any,
      });

      manager.addBreadcrumb({ type: 'debug', message: 'kept', level: 'info' });

      const crumbs = manager.getBreadcrumbs();

      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].message).toBe('kept');
      expect(crumbs[0].timestamp).toBeTypeOf('number');
      expect(warnSpy).toHaveBeenCalledWith('[Hawk] beforeBreadcrumb returned nothing, storing original breadcrumb.');
      warnSpy.mockRestore();
    });

    it('stores original breadcrumb and warns when hook returns true (invalid)', () => {
      const manager = BreadcrumbManager.getInstance();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeBreadcrumb: () => true as any,
      });

      manager.addBreadcrumb({ type: 'debug', message: 'kept', level: 'info' });

      const crumbs = manager.getBreadcrumbs();

      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].message).toBe('kept');
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it('stores original breadcrumb and warns when hook returns object with non-numeric timestamp', () => {
      const manager = BreadcrumbManager.getInstance();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeBreadcrumb: () => ({ timestamp: 'not-a-number', message: 'bad' }) as any,
      });

      manager.addBreadcrumb({ type: 'debug', message: 'original', level: 'info' });

      const crumbs = manager.getBreadcrumbs();

      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].message).toBe('original');
      expect(crumbs[0].timestamp).toBeTypeOf('number');
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it('filters by category', () => {
      const manager = BreadcrumbManager.getInstance();

      manager.init({
        beforeBreadcrumb: (bc) => (bc.category === 'secret' ? false : bc),
      });

      manager.addBreadcrumb({ type: 'debug', message: 'keep', level: 'info', category: 'public' });
      manager.addBreadcrumb({ type: 'debug', message: 'drop', level: 'info', category: 'secret' });

      const crumbs = manager.getBreadcrumbs();

      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].message).toBe('keep');
    });
  });

  it('ignores second init call', () => {
    const manager = BreadcrumbManager.getInstance();

    manager.init({ maxBreadcrumbs: 5 });
    manager.init({ maxBreadcrumbs: 100 });

    for (let i = 0; i < 10; i++) {
      manager.addBreadcrumb({ type: 'debug', message: `msg-${i}`, level: 'info' });
    }

    /**
     * Should still be 5, not 100
     */
    expect(manager.getBreadcrumbs()).toHaveLength(5);
  });
});
