'use client';

import { Box, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export interface SearchFilters {
  languages: string[];
  codeTypes: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
];

const CODE_TYPES = [
  { value: 'function', label: '函数' },
  { value: 'class', label: '类' },
  { value: 'interface', label: '接口' },
  { value: 'file', label: '完整文件' },
];

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleLanguageChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      languages: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleCodeTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      codeTypes: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleLanguageDelete = (language: string) => {
    onFiltersChange({
      ...filters,
      languages: filters.languages.filter((l) => l !== language),
    });
  };

  const handleCodeTypeDelete = (codeType: string) => {
    onFiltersChange({
      ...filters,
      codeTypes: filters.codeTypes.filter((t) => t !== codeType),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 600, mx: 'auto' }}>
      <FormControl fullWidth>
        <InputLabel id="language-select-label">编程语言</InputLabel>
        <Select
          labelId="language-select-label"
          multiple
          value={filters.languages}
          onChange={handleLanguageChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  onDelete={() => handleLanguageDelete(value)}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                />
              ))}
            </Box>
          )}
        >
          {PROGRAMMING_LANGUAGES.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="code-type-select-label">代码类型</InputLabel>
        <Select
          labelId="code-type-select-label"
          multiple
          value={filters.codeTypes}
          onChange={handleCodeTypeChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={CODE_TYPES.find((t) => t.value === value)?.label}
                  onDelete={() => handleCodeTypeDelete(value)}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                />
              ))}
            </Box>
          )}
        >
          {CODE_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}