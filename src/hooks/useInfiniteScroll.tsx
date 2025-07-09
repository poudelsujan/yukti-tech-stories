
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  data: T[];
  itemsPerPage?: number;
  loading?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  reset: () => void;
}

export const useInfiniteScroll = <T,>({
  data,
  itemsPerPage = 20,
  loading = false
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayedItems = data.slice(0, currentPage * itemsPerPage);
  const hasMore = displayedItems.length < data.length && !loading;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setIsLoadingMore(false);
  }, []);

  // Reset pagination when data changes (e.g., after filtering)
  useEffect(() => {
    reset();
  }, [data.length, reset]);

  // Auto-load when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      ) {
        loadMore();
      }
    };

    if (hasMore && !isLoadingMore) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, isLoadingMore, loadMore]);

  return {
    displayedItems,
    hasMore,
    loadMore,
    isLoadingMore,
    reset
  };
};
