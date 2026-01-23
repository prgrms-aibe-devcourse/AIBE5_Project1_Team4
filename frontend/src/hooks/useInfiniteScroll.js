import { useEffect, useRef } from 'react';

/**
 * 무한 스크롤을 위한 커스텀 훅
 * Intersection Observer를 사용하여 요소가 뷰포트에 들어올 때 콜백을 실행
 *
 * @param {Object} options - 옵션 객체
 * @param {Function} options.onIntersect - 요소가 뷰포트에 들어올 때 호출되는 콜백
 * @param {boolean} options.enabled - 관찰 활성화 여부 (기본값: true)
 * @param {number} options.threshold - 요소가 얼마나 보여야 트리거할지 (0~1, 기본값: 0.1)
 * @param {string} options.rootMargin - 루트 요소의 마진 (기본값: '0px')
 * @returns {Object} { targetRef } - 관찰할 요소에 연결할 ref
 *
 * @example
 * const { targetRef } = useInfiniteScroll({
 *   onIntersect: loadMore,
 *   enabled: hasMore && !isLoading,
 * });
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={targetRef} />
 *   </>
 * );
 */
export function useInfiniteScroll({
  onIntersect,
  enabled = true,
  threshold = 0.1,
  rootMargin = '0px',
}) {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && onIntersect) {
          onIntersect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [enabled, onIntersect, threshold, rootMargin]);

  return { targetRef };
}

export default useInfiniteScroll;
