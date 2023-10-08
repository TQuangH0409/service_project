import "dotenv/config";

export const configs = {
    service: "file",
    environment: process.env.CA_FILE_ENVIRONMENT || "dev",
    app: {
        prefix: "/api/v1",
        host: process.env.CA_FILE_HOST_NAME || "0.0.0.0",
        port: process.env.CA_FILE_PORT_NUMBER || "6802",
    },
    mongo: {
        addresses: process.env.CA_FILE_MONGO_ADDRESSES || "127.0.0.1:27001",
        username: process.env.CA_FILE_MONGO_USERNAME || "root",
        password: process.env.CA_FILE_MONGO_PASSWORD || "",
        dbName: process.env.CA_FILE_MONGO_DB_NAME || "file",
        templateUri:
            "mongodb+srv://${username}:${password}@${addresses}/${dbName}",
        getUri: function (): string {
            let uri = this.templateUri;
            const password = encodeURIComponent(this.password);
            const username = encodeURIComponent(this.username);
            uri = uri.replace("${username}", username);
            uri = uri.replace("${password}", password);
            uri = uri.replace("${dbName}", this.dbName);
            uri = uri.replace("${addresses}", this.addresses);
            return uri;
        },
    },
    keys: {
        public: process.env.CA_FILE_PUBLIC_KEY || "",
        checkPublicKey: function (): void {
            if (!this.public) {
                throw new Error("Missing public key in environment variable");
            }
        },
    },
    log: {
        logFileEnabled: process.env.CA_FILE_LOG_FILE_ENABLED || "true",
        folderLogsPath:
            process.env.CA_FILE_FOLDER_LOGS_PATH || `${__dirname}/../../logs`,

        logstashEnabled: process.env.CA_FILE_LOG_LOGSTASH_ENABLED || "false",
        logstashHost: process.env.CA_FILE_LOG_LOGSTASH_HOST || "127.0.0.1",
        logstashPort: process.env.CA_FILE_LOG_LOGSTASH_PORT || "50001",
        logstashProtocol: process.env.CA_FILE_LOG_LOGSTASH_PROTOCOL || "udp",
    },
    googleapis: {
        client_id: process.env.CA_CLIENT_ID || "1",
        client_secret: process.env.CA_CLIENT_SECRET || "1",
        client_refresh_token: process.env.CA_CLIENT_REFRESH_TOKEN || "1",
        client_redirect_uri: process.env.CA_CLIENT_REDIRECT_URI || "1",
    },
    redis: {
        host: process.env.CA_FILE_REDIS_HOST || "127.0.0.1",
        port: process.env.CA_FILE_REDIS_PORT || "6380",
        username: process.env.CA_FILE_REDIS_USERNAME || "",
        password: process.env.CA_FILE_REDIS_PASSWORD || "",
    },
};

configs.keys.checkPublicKey();
