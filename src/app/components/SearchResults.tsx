'use client';

import { Box, Typography, CircularProgress, Snackbar, Skeleton } from '@mui/material';
import { useState, memo } from 'react';
import SearchResultItem from './SearchResultItem';

/**
 * 搜索结果项的接口定义
 */
export interface SearchResult {
  id: string;
  title: string;
  code: string;
  language: string;
  repository: string;
  url: string;
}

/**
 * 搜索结果组件的属性接口
 */
interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
}

/**
 * 搜索结果骨架屏组件
 */
const SearchResultSkeleton = memo(() => (
  <Box sx={{ mb: 2 }}>
    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="rectangular" height={200} />
  </Box>
));

SearchResultSkeleton.displayName = 'SearchResultSkeleton';

/**
 * 搜索结果展示组件 - 简化版
 */
const SearchResults = ({ results, loading = false }: SearchResultsProps) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleCopySuccess = () => {
    setShowCopySuccess(true);
  };

  // 显示加载状态
  if (loading) {
    return (
      <Box sx={{ mt: 4, width: '100%', maxWidth: 800, mx: 'auto' }}>
        {[...Array(3)].map((_, index) => (
          <SearchResultSkeleton key={index} />
        ))}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            正在搜索相关代码...
          </Typography>
        </Box>
      </Box>
    );
  }

  // 显示空结果提示
  if (results.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          暂无搜索结果
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, width: '100%', maxWidth: 800, mx: 'auto' }}>
      {results.map((result) => (
        <Box key={result.id}>
          <SearchResultItem result={result} onCopySuccess={handleCopySuccess} />
        </Box>
      ))}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="代码已复制到剪贴板"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SearchResults;