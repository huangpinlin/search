import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        正在加载...
      </Typography>
    </Box>
  );
} 