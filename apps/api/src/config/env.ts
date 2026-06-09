import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  appBaseUrl: required("APP_BASE_URL", "http://localhost:5173"),
  apiBaseUrl: required("API_BASE_URL", "http://localhost:4000"),

  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET", "demo-session-secret-change-me"),

  vehicleLookupProvider: (process.env.VEHICLE_LOOKUP_PROVIDER ?? "checkcardetails") as
    | "mock"
    | "oneautoapi"
    | "dvla"
    | "checkcardetails",
  checkCarDetailsApiKey: process.env.CHECK_CAR_DETAILS_API_KEY ?? "652c5a55ef926ab5e5396ad9589ca84c",
  oneAutoApiBaseUrl: process.env.ONEAUTOAPI_BASE_URL,
  oneAutoApiKey: process.env.ONEAUTOAPI_KEY,
  dvlaVesBaseUrl:
    process.env.DVLA_VES_BASE_URL ??
    "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry",
  dvlaVesApiKey: process.env.DVLA_VES_API_KEY,

  stripeSecretKey: required("STRIPE_SECRET_KEY", "sk_test_demo_placeholder"),
  stripeWebhookSecret: required("STRIPE_WEBHOOK_SECRET", "whsec_demo_placeholder"),

  resendApiKey: required("RESEND_API_KEY", "re_demo_placeholder"),
  emailFrom: process.env.EMAIL_FROM ?? "Day Drive <onboarding@resend.dev>",

  documentStorage: (process.env.DOCUMENT_STORAGE ?? "local") as "local" | "s3" | "blob",
  localDocsDir: process.env.LOCAL_DOCS_DIR ?? "storage",
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION,
  s3Endpoint: process.env.S3_ENDPOINT,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};
