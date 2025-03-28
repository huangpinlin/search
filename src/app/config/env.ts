'use client';

/**
 * 环境变量配置接口
 */
export interface Env {
  githubToken: string;
  gitlabToken: string;
}

/**
 * 环境变量配置
 */
export const env: Env = {
  // GitHub API Token
  githubToken: process.env.GITHUB_TOKEN || '',

  // GitLab API Token
  gitlabToken: process.env.GITLAB_TOKEN || '',
};