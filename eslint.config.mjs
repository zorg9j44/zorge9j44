import nextConfig from "eslint-config-next";

const config = [{ ignores: ["worker/**", "_archive_stroy_master/**"] }, ...nextConfig];

export default config;
