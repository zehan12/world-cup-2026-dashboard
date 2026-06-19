import axios from "axios";

// Create a pre-configured axios instance
const httpApiClient = axios.create({
	timeout: 15000,
	headers: {
		"Cache-Control": "no-cache",
		Pragma: "no-cache",
		Expires: "0",
	},
});

export default httpApiClient;
