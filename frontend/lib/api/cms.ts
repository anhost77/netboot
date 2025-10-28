import { apiClient } from './client';

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const cmsAPI = {
  // Get all pages (public)
  async getPages(filters?: { status?: string; search?: string }): Promise<{ data: CmsPage[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    return apiClient.get(`/cms/pages?${params.toString()}`);
  },

  // Get page by slug (public)
  async getPageBySlug(slug: string): Promise<CmsPage> {
    return apiClient.get(`/cms/pages/slug/${slug}`);
  },

  // Create page (admin only)
  async createPage(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status?: 'draft' | 'published';
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }): Promise<CmsPage> {
    return apiClient.post('/cms/pages', data);
  },

  // Update page (admin only)
  async updatePage(id: string, data: Partial<CmsPage>): Promise<CmsPage> {
    return apiClient.patch(`/cms/pages/${id}`, data);
  },

  // Delete page (admin only)
  async deletePage(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/cms/pages/${id}`);
  },
};
