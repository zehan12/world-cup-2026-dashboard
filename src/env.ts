import { createEnv } from "@t3-oss/env-core";
import { clientSchema } from "@/schemas/env";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: clientSchema,
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});

export default env;
