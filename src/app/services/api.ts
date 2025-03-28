'use client';

import axios from 'axios';
import { env } from '../config/env';

/**
 * 代码搜索参数接口
 * @interface CodeSearchParams
 * @property {string} query - 搜索关键词
 * @property {string[]} [languages] - 可选的编程语言过滤器
 * @property {string[]} [codeTypes] - 可选的代码类型过滤器（函数、类、接口等）
 * @property {number} [page] - 分页页码
 * @property {number} [perPage] - 每页结果数量
 */
export interface CodeSearchParams {
  query: string;
  languages?: string[];
  codeTypes?: string[];
  page?: number;
  perPage?: number;
  /** 自定义文件扩展名过滤 */
  customExtensions?: string[];
}

/**
 * 代码搜索响应接口
 * @interface CodeSearchResponse
 * @property {Object[]} items - 搜索结果列表
 * @property {string} items[].id - 结果唯一标识符
 * @property {string} items[].title - 结果标题
 * @property {string} items[].code - 代码内容
 * @property {string} items[].language - 编程语言
 * @property {string} items[].repository - 仓库名称
 * @property {string} items[].url - 代码链接
 * @property {number} totalCount - 总结果数量
 * @property {boolean} hasMore - 是否还有更多结果
 */
export interface CodeSearchResponse {
  items: {
    id: string;
    title: string;
    code: string;
    language: string;
    repository: string;
    url: string;
  }[];
  totalCount: number;
  hasMore: boolean;
}

// API端点常量
const GITHUB_API_URL = 'https://api.github.com';
const GITLAB_API_URL = 'https://gitlab.com/api/v4';

/**
 * 代码搜索服务类
 * 提供GitHub和GitLab代码搜索功能
 */
export class CodeSearchService {
  private githubToken: string;
  private gitlabToken: string;

  constructor() {
    this.githubToken = env.githubToken;
    this.gitlabToken = env.gitlabToken;
  }

  /**
   * 在GitHub上搜索代码
   * @param {CodeSearchParams} params - 搜索参数
   * @returns {Promise<CodeSearchResponse>} 搜索结果
   * @throws {Error} 当搜索请求失败时抛出错误
   */
  async searchGitHub(params: CodeSearchParams): Promise<CodeSearchResponse> {
    try {
      // 验证查询参数
      if (!params.query.trim()) {
        return {
          items: [],
          totalCount: 0,
          hasMore: false
        };
      }

      // Token 验证
      if (!this.githubToken) {
        throw new Error('GitHub Token未配置，请在.env文件中设置GITHUB_TOKEN');
      }

      if (!this.githubToken.startsWith('ghp_') && !this.githubToken.startsWith('github_pat_')) {
        throw new Error('GitHub Token格式无效，请使用正确的Personal Access Token');
      }

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${this.githubToken}`,
      };

      // 首先验证token是否有效
      try {
        await axios.get('https://api.github.com/user', { headers });
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('GitHub Token无效或已过期，请重新生成Token');
        } else if (error.response?.status === 403) {
          throw new Error('GitHub Token权限不足，请确保包含正确的访问权限');
        }
        throw error;
      }

      const query = this.buildGitHubQuery(params);
      
      console.log('GitHub search details:', {
        query,
        languages: params.languages,
        codeTypes: params.codeTypes,
      });

      // 增加延迟和重试逻辑
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1秒延迟

      while (retryCount < maxRetries) {
        try {
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }

          const response = await axios.get(`${GITHUB_API_URL}/search/code`, {
            headers,
            params: {
              q: query,
              page: params.page || 1,
              per_page: params.perPage || 30,
            },
          });

          // 检查剩余API限制
          const rateLimit = {
            remaining: response.headers['x-ratelimit-remaining'],
            reset: response.headers['x-ratelimit-reset'],
            limit: response.headers['x-ratelimit-limit'],
          };

          console.log('GitHub API rate limit:', rateLimit);

          return {
            items: response.data.items.map(this.transformGitHubResult),
            totalCount: response.data.total_count,
            hasMore: response.data.items.length === (params.perPage || 30),
          };
        } catch (error: any) {
          if (error.response?.status === 403) {
            const resetTime = error.response.headers['x-ratelimit-reset'];
            if (resetTime) {
              const waitTime = new Date(resetTime * 1000).getTime() - Date.now();
              throw new Error(`API访问频率限制，请等待 ${Math.ceil(waitTime / 1000)} 秒后重试`);
            }
          }

          if (error.response?.status === 422 && retryCount < maxRetries - 1) {
            params.languages = params.languages?.slice(0, 1);
            params.codeTypes = params.codeTypes?.slice(0, 1);
            retryCount++;
            continue;
          }
          throw error;
        }
      }

      throw new Error('达到最大重试次数');
    } catch (error: any) {
      console.error('GitHub search error:', {
        message: error.message,
        status: error.response?.status,
        rateLimit: {
          remaining: error.response?.headers?.['x-ratelimit-remaining'],
          reset: error.response?.headers?.['x-ratelimit-reset'],
        },
      });

      // 更详细的错误信息
      if (error.response?.status === 401) {
        throw new Error('GitHub认证失败：Token无效或已过期，请重新生成Token');
      } else if (error.response?.status === 403) {
        if (error.response.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
          throw new Error(`API访问次数已达上限，请等待至 ${resetTime.toLocaleString()} 后重试`);
        }
        throw new Error('GitHub API访问受限：Token可能无效或权限不足');
      } else if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors?.map((e: { location: string; message: string }) => `[位置:${e.location}] ${e.message}`).join('\n') || '未知语法错误';
      throw new Error(`搜索语法错误：\n${errorDetails}\n建议：1.检查括号匹配 2.避免连续特殊符号 3.使用明确的AND/OR逻辑运算符`);
      }

      if (error.message.includes('API访问频率限制') || error.message.includes('已达上限')) {
        throw error;
      }
      throw new Error(`参数错误：${error.message}`);
    }
  }

  /**
   * 在GitLab上搜索代码
   * @param {CodeSearchParams} params - 搜索参数
   * @returns {Promise<CodeSearchResponse>} 搜索结果
   * @throws {Error} 当搜索请求失败时抛出错误
   */
  async searchGitLab(params: CodeSearchParams): Promise<CodeSearchResponse> {
    try {
      const headers: Record<string, string> = {};

      if (this.gitlabToken) {
        headers['PRIVATE-TOKEN'] = this.gitlabToken;
      }

      // 处理搜索词，使其更宽松
      const searchQuery = params.query
        .split(/\s+/)
        .filter(Boolean)
        .join(' OR ');

      const response = await axios.get(`${GITLAB_API_URL}/search`, {
        headers,
        params: {
          scope: 'blobs',
          search: searchQuery,
          page: params.page || 1,
          per_page: params.perPage || 20, // 增加每页结果数
        },
      });

      // 验证响应数据
      if (!Array.isArray(response.data)) {
        throw new Error('GitLab API返回了意外的数据格式');
      }

      // 获取分页信息
      const totalCount = parseInt(response.headers['x-total'] || '0', 10);
      const currentPage = parseInt(response.headers['x-page'] || '1', 10);
      const perPage = parseInt(response.headers['x-per-page'] || '10', 10);

      // 转换并返回结果
      return {
        items: response.data.map(item => this.transformGitLabResult(item)),
        totalCount,
        hasMore: currentPage * perPage < totalCount,
      };
    } catch (error: any) {
      console.error('GitLab search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: this.gitlabToken ? '已配置' : '未配置',
        query: params.query,
        searchMeta: {
          page: params.page,
          perPage: params.perPage,
          languages: params.languages,
        }
      });

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          throw new Error('GitLab认证失败，请检查Token配置');
        } else if (status === 403) {
          throw new Error('GitLab API访问受限，可能是超出限制或Token无效');
        } else if (status === 404) {
          throw new Error('GitLab API端点未找到');
        } else if (status === 429) {
          throw new Error('GitLab API请求次数超限，请稍后重试');
        }
      }

      throw new Error('GitLab搜索失败，请检查网络连接或稍后重试');
    }
  }

  /**
   * 构建GitHub搜索查询字符串
   * @private
   * @param {CodeSearchParams} params - 搜索参数
   * @returns {string} 格式化的查询字符串
   */
  private buildGitHubQuery(params: CodeSearchParams): string {
    // 简化搜索查询构建
    let query = params.query.trim();
    if (!query) return '';

    // 基础清理：移除所有特殊字符，只保留基本字符
    query = query
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 只保留字母、数字、空格和中文
      .replace(/\s+/g, ' ')                   // 规范化空格
      .trim();

    // 简单搜索词验证
    if (query.length < 2) {
      query = `${query} code`; // 对于太短的查询，添加"code"关键词
    }

    const queryParts = [];
    
    // 添加主查询词
    queryParts.push(query);

    // 添加语言过滤器（最多一个）
    if (params.languages?.length) {
      const lang = params.languages[0];
      queryParts.push(`language:${lang}`);
    }

    // 添加简化的文件类型过滤
    if (params.codeTypes?.length) {
      // 文件扩展名映射
      const extensionsByType: Record<string, string> = {
        'function': 'js',
        'class': 'java',
        'interface': 'ts',
        'test': 'test.js',
        'file': 'md'
      };
      
      // 选择第一个代码类型的第一个扩展名
      const type = params.codeTypes[0];
      const ext = extensionsByType[type];
      
      if (ext) {
        queryParts.push(`extension:${ext}`);
      }
    }

    // 返回简单的查询字符串
    return queryParts.join(' ');
  }

  /**
   * 转换GitHub搜索结果为统一格式
   * @private
   * @param {any} item - GitHub API返回的结果项
   * @returns {Object} 标准化的结果对象
   */
  private transformGitHubResult(item: any) {
    return {
      id: item.sha,
      title: item.name,
      code: item.content ? Buffer.from(item.content, 'base64').toString() : '',
      language: item.language?.toLowerCase() || 'text',
      repository: item.repository?.full_name || '',
      url: item.html_url,
    };
  }

  /**
   * 转换GitLab搜索结果为统一格式
   * @private
   * @param {any} item - GitLab API返回的结果项
   * @returns {Object} 标准化的结果对象
   */
  private transformGitLabResult(item: any): CodeSearchResponse['items'][0] {
    if (!item || typeof item !== 'object') {
      throw new Error('无效的GitLab搜索结果项');
    }

    return {
      id: item.id?.toString() || '',
      title: item.path || '',
      code: item.data || '',
      language: item.language || '未知',
      repository: item.project_id?.toString() || '',
      url: item.web_url || '',
    };
  }
}

// 导出服务实例
export const codeSearchService = new CodeSearchService();