/**
 * MarketLink Backend API & Documentation Configuration
 * Backend Server: http://172.16.2.89:8081
 * Swagger UI Documentation: http://172.16.2.89:8081/swagger-ui/index.html
 */
export const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_TARGET || 'http://172.16.2.89:8081',
  SWAGGER_DOCS_URL: import.meta.env.VITE_SWAGGER_URL || (import.meta.env.VITE_BACKEND_TARGET ? `${import.meta.env.VITE_BACKEND_TARGET}/swagger-ui/index.html` : 'http://172.16.2.89:8081/swagger-ui/index.html'),
  API_PREFIX: '/api',
};

export default API_CONFIG;
