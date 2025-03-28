'use client';

import { useState } from 'react';
import { Box, Container, TextField, Typography, Paper, IconButton, InputAdornment, CircularProgress, Alert, AlertTitle } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import CodeIcon from '@mui/icons-material/Code';
import SearchFilters, { SearchFilters as SearchFiltersType } from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import SearchHelp from './components/SearchHelp';
import { codeSearchService } from './services/api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({
    languages: [],
    codeTypes: [],
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTips, setSearchTips] = useState<string | null>(null);

  const validateSearch = () => {
    if (!searchQuery.trim()) {
      setError('请输入搜索关键词');
      return false;
    }

    if (searchQuery.length > 100) {
      setError('搜索词过长，请缩短内容（不超过100个字符）');
      return false;
    }

    if (/[[\]{}^$?*+|\\]/.test(searchQuery)) {
      setSearchTips('搜索词包含特殊字符，可能影响结果准确性');
    } else {
      setSearchTips(null);
    }

    if (filters.languages.length > 1) {
      setSearchTips('建议每次只选择一种编程语言，以获得更准确的结果');
    }

    return true;
  };

  const handleSearch = async () => {
    if (!validateSearch()) return;

    setLoading(true);
    setError(null);

    try {
      const githubResults = await codeSearchService.searchGitHub({
        query: searchQuery,
        languages: filters.languages.slice(0, 1),
        codeTypes: filters.codeTypes,
      });

      // 临时注释掉GitLab搜索，以便测试GitHub搜索功能
      /*
      const gitlabResults = await codeSearchService.searchGitLab({
        query: searchQuery,
        languages: filters.languages,
        codeTypes: filters.codeTypes,
      });

      setResults([
        ...githubResults.items,
        ...gitlabResults.items,
      ]);
      */
      
      // 仅使用GitHub结果
      setResults(githubResults.items);
      
    } catch (err) {
      let errorMessage = '搜索过程中发生错误，请稍后重试';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setSearchQuery(query);
    setFilters({
      languages: ['JavaScript'],
      codeTypes: ['function'],
    });
    
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 8,
          pb: 6,
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <CodeIcon sx={{ fontSize: 45 }} />
          代码语义搜索
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          基于语义的智能代码搜索引擎，支持多平台代码检索与分析
        </Typography>

        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
            mt: 4,
            mb: 4,
          }}
          elevation={3}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <TextField
            fullWidth
            placeholder="输入搜索关键词，如：login function"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <SearchHelp onExampleClick={handleExampleClick} />

        {searchTips && (
          <Alert severity="info" sx={{ width: '100%', maxWidth: 600, mb: 2 }}>
            <AlertTitle>搜索提示</AlertTitle>
            {searchTips}
          </Alert>
        )}

        <SearchFilters filters={filters} onFiltersChange={setFilters} />

        {error && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
            <AlertTitle>错误</AlertTitle>
            {error}
          </Alert>
        )}

        <SearchResults results={results} loading={loading} />

        <Box sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <GitHubIcon />
          <Typography variant="body2" color="text.secondary">
            支持 GitHub、GitLab 等多平台代码检索
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}