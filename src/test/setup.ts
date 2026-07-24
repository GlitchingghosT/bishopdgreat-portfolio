import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly scrollMargin = '0px'
  readonly thresholds = [0]
  private callback: IntersectionObserverCallback
  disconnect = () => undefined
  observe = (element: Element) => {
    this.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this)
  }
  takeRecords = () => []
  unobserve = () => undefined

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
}

if (typeof window !== 'undefined') {
  afterEach(() => cleanup())

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: IntersectionObserverMock,
  })

  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    writable: true,
    value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0),
  })

  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    writable: true,
    value: (id: number) => window.clearTimeout(id),
  })
}
