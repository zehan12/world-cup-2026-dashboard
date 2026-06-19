import type { AxiosInstance } from "axios";

export const setupInterceptors = (apiClient: AxiosInstance) => {
	// Request Interceptor
	apiClient.interceptors.request.use(
		(config) => {
			// You can attach auth tokens here if needed in the future
			console.log(
				`[API Request] ${config.method?.toUpperCase()} ${config.url}`,
			);
			return config;
		},
		(error) => {
			console.error("[API Request Error]", error);
			return Promise.reject(error);
		},
	);

	// Response Interceptor
	apiClient.interceptors.response.use(
		(response) => {
			// Log successful responses
			console.log(
				`[API Response] ${response.status} from ${response.config.url}`,
			);
			return response;
		},
		(error) => {
			// Handle global API errors (e.g., 401 Unauthorized, 500 Server Error)
			console.error(
				"[API Response Error]",
				error.response?.status,
				error.message,
			);
			return Promise.reject(error);
		},
	);
};
