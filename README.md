# 代码搜索服务

一个基于Next.js构建的代码搜索应用，支持在GitHub和GitLab上搜索代码片段。提供统一的搜索接口和结果格式，让代码搜索更加便捷高效。
（若使用请删除.env和.env.example的TOKEN后的hpl）
## 功能特性

- 多平台支持：同时支持GitHub和GitLab代码搜索
- 智能过滤：支持按编程语言和代码类型（函数、类、接口等）过滤
- 统一接口：提供统一的搜索参数和结果格式
- 分页加载：支持搜索结果分页，提升性能
- 实时预览：搜索结果支持代码高亮和上下文展示

## 技术架构

- **前端框架**: Next.js 13+ (App Router)
- **编程语言**: TypeScript
- **HTTP客户端**: Axios
- **API集成**: GitHub API, GitLab API

## 快速开始

### 环境要求

- Node.js 16+
- npm 7+

### 安装和运行

1. 克隆项目并安装依赖
```bash
git clone [项目地址]
cd code-search
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，配置必要的环境变量
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
npm start
```

## 搜索语法指南

### 基础搜索
- 关键词搜索：直接输入要搜索的代码片段或函数名
- 文件类型：使用`extension:js`限定文件类型
- 多条件：支持`AND`、`OR`组合搜索

### 高级过滤
- 语言过滤：`language:javascript`
- 仓库过滤：`repo:owner/name`
- 路径过滤：`path:src/components`

## API服务

### CodeSearchService

主要接口参数：
```typescript
interface CodeSearchParams {
  query: string;          // 搜索关键词
  languages?: string[];   // 编程语言过滤器
  codeTypes?: string[];   // 代码类型过滤器
  page?: number;          // 分页页码
  perPage?: number;       // 每页结果数量
}
```

### 错误处理

常见错误码及处理方式：
- 401: 未授权，检查API Token配置
- 403: 请求限制，考虑降低请求频率
- 422: 参数错误，检查搜索参数格式

## 性能优化

### 客户端优化
- 实现请求防抖
- 结果缓存
- 懒加载和虚拟滚动

### 服务端优化
- 并发请求多平台
- 结果聚合和排序
- 缓存热门搜索

## 配置说明

### 环境变量

```env
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
API_RATE_LIMIT=100
CACHE_DURATION=3600
```

### API认证

#### GitHub Token配置
1. 访问GitHub Settings > Developer settings > Personal access tokens
2. 生成新token，选择`repo`和`read:user`权限
3. 配置到环境变量`GITHUB_TOKEN`

#### GitLab Token配置
1. 访问GitLab Settings > Access Tokens
2. 生成新token，选择`read_api`权限
3. 配置到环境变量`GITLAB_TOKEN`

## 项目结构

```
src/
  app/
    components/    # React组件
    services/      # 服务层
      api.ts      # API服务实现
    config/       # 配置文件
    layout.tsx    # 布局组件
    page.tsx      # 主页面
```

## 常见问题

### Q: 搜索结果不准确？
A: 确保使用正确的搜索语法，并尝试调整过滤条件

### Q: API请求失败？
A: 检查Token配置和请求频率限制

### Q: 性能问题？
A: 参考性能优化章节，实现必要的优化措施

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
>>>>>>> 1c60903 (first commit)
>>>>>>> c69b07c (first commit)
>>>>>>> c3d2a0a (提交文件)
