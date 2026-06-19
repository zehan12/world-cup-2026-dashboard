import axios from "axios";
import { setupInterceptors } from "./interceptors";

// Create a pre-configured axios instance
const httpApiClient = axios.create({
	timeout: 15000,
	headers: {
		"Cache-Control": "no-cache",
		Pragma: "no-cache",
		Expires: "0",
	},
});

setupInterceptors(httpApiClient);

export default httpApiClient;
