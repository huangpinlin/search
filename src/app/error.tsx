'use client';

import { useEffect } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('应用错误:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          出现了一些问题
        </Typography>
        
        <Typography variant="body1" sx={{ my: 2 }}>
          很抱歉，应用程序遇到了错误。请尝试重新加载页面。
        </Typography>
        
        {process.env.NODE_ENV === 'development' && (
          <Paper
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              mb: 3,
              maxHeight: '200px',
              overflow: 'auto',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8rem' }}>
              {error.message || '未知错误'}
              {error.stack && `\n\n${error.stack}`}
            </Typography>
          </Paper>
        )}
        
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => reset()}
          color="primary"
        >
          重试
        </Button>
      </Paper>
    </Box>
  );
} 