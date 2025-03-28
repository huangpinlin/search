'use client';

import { Box, Paper, Typography, IconButton, useTheme, Collapse } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { memo, useState, useCallback, useEffect } from 'react';

const MAX_CODE_LENGTH = 300;

/**
 * 搜索结果项的Props接口定义
 */
export interface SearchResultItemProps {
  result: {
    id: string;
    title: string;
    code: string;
    language: string;
    repository: string;
    url: string;
  };
  onCopySuccess: () => void;
}

/**
 * 搜索结果项组件 - 展示单个代码搜索结果
 * 简化版本，不使用动态导入的SyntaxHighlighter
 */
const SearchResultItem = memo(({ result, onCopySuccess }: SearchResultItemProps) => {
  const [expanded, setExpanded] = useState(() => result.code.length <= MAX_CODE_LENGTH);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setExpanded(result.code.length <= MAX_CODE_LENGTH);
    return () => {
      setError(null);
    };
  }, [result.code.length]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.code);
      onCopySuccess();
    } catch (err) {
      setError('复制失败，请重试');
      console.error('Copy error:', err);
    }
  }, [result.code, onCopySuccess]);

  return (
    <Paper
      id={result.id}
      tabIndex={0}
      role="article"
      aria-label={`代码片段：${result.title}`}
      sx={{
        p: 2,
        mb: 2,
        position: 'relative',
        '&:hover .actions': {
          opacity: 1,
        },
      }}
      elevation={2}
    >
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h3">
          {result.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {result.repository}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Box
          className="actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 0.5,
            zIndex: 1,
            boxShadow: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleCopyCode}
            title="复制代码"
            aria-label="复制代码"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            title="在新窗口打开"
            aria-label="在新窗口打开"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          {result.code.length > MAX_CODE_LENGTH && (
            <IconButton
              size="small"
              onClick={() => setExpanded(prev => !prev)}
              title={expanded ? '收起代码' : '展开代码'}
              aria-label={expanded ? '收起代码' : '展开代码'}
              aria-expanded={expanded}
            >
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>

        {error && (
          <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
            {error}
          </Typography>
        )}

        <Collapse in={expanded} timeout="auto">
          <Box 
            sx={{ 
              position: 'relative',
              maxHeight: expanded ? 'none' : '200px',
              overflow: 'auto',
              p: 2,
              backgroundColor: theme.palette.grey[100],
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {result.code}
          </Box>
        </Collapse>

        {!expanded && result.code.length > MAX_CODE_LENGTH && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setExpanded(true)}
          >
            点击展开完整代码
          </Typography>
        )}
      </Box>
    </Paper>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;