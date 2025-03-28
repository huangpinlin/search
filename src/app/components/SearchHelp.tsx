'use client';

import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useState } from 'react';

interface SearchHelpProps {
  onExampleClick: (query: string) => void;
}

export default function SearchHelp({ onExampleClick }: SearchHelpProps) {
  const [open, setOpen] = useState(false);

  const searchExamples = [
    { query: 'login function', description: '搜索登录功能的代码' },
    { query: 'database connection', description: '搜索数据库连接代码' },
    { query: 'user authentication', description: '用户认证相关代码' },
    { query: 'file upload', description: '文件上传功能' },
    { query: 'api request', description: 'API请求函数' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Button 
        startIcon={<HelpOutlineIcon />}
        onClick={() => setOpen(!open)}
        sx={{ mb: 1 }}
        size="small"
        color="info"
      >
        {open ? '隐藏搜索帮助' : '显示搜索帮助'}
      </Button>
      
      {open && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            搜索语法指南
          </Typography>
          
          <Typography variant="body2" paragraph>
            为了获得最佳搜索结果，请遵循以下建议：
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary="使用简单关键词" 
                secondary="例如：'login' 或 '用户登录'"
              />
            </ListItem>
            <Divider component="li" />
            
            <ListItem>
              <ListItemText 
                primary="避免特殊字符" 
                secondary="不要使用 [ ] { } ^ $ ? * + 等特殊字符"
              />
            </ListItem>
            <Divider component="li" />
            
            <ListItem>
              <ListItemText 
                primary="限制关键词数量" 
                secondary="使用2-3个关键词效果最佳"
              />
            </ListItem>
            <Divider component="li" />
            
            <ListItem>
              <ListItemText 
                primary="选择单个语言过滤器" 
                secondary="每次搜索只选择一种编程语言"
              />
            </ListItem>
          </List>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            搜索示例:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchExamples.map((example, index) => (
              <Button 
                key={index}
                size="small" 
                variant="outlined"
                onClick={() => onExampleClick(example.query)}
                title={example.description}
              >
                {example.query}
              </Button>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
} 