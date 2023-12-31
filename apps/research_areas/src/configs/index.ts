import "dotenv/config";

export const configs = {
    service: "research_areas",
    environment: process.env.CA_RESEARCH_AREAS_ENVIRONMENT || "dev",
    app: {
        prefix: "/api/v1",
        host: process.env.CA_RESEARCH_AREAS_HOST_NAME || "0.0.0.0",
        port: process.env.CA_RESEARCH_AREAS_PORT_NUMBER || "6804",
    },
    mongo: {
        addresses: process.env.CA_RESEARCH_AREAS_MONGO_ADDRESSES || "rs0",
        username: process.env.CA_RESEARCH_AREAS_MONGO_USERNAME || "root",
        password: process.env.CA_RESEARCH_AREAS_MONGO_PASSWORD || "",
        dbName: process.env.CA_RESEARCH_AREAS_MONGO_DB_NAME || "auth",
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
    redis: {
        host: process.env.CA_RESEARCH_AREAS_REDIS_HOST || "127.0.0.1",
        port: process.env.CA_RESEARCH_AREAS_REDIS_PORT || "6380",
        username: process.env.CA_RESEARCH_AREAS_REDIS_USERNAME || "",
        password: process.env.CA_RESEARCH_AREAS_REDIS_PASSWORD || "",
    },
    keys: {
        public: process.env.CA_RESEARCH_AREAS_PUBLIC_KEY || "",
        checkSecretKeyPublicKey: function (): void {
            if (!this.public) {
                throw new Error("Missing public key in environment variable");
            }
        },
    },
    log: {
        logFileEnabled:
            process.env.CA_RESEARCH_AREAS_LOG_FILE_ENABLED || "false",
        folderLogsPath:
            process.env.CA_RESEARCH_AREAS_FOLDER_LOGS_PATH ||
            `${__dirname}/../../logs`,

        logstashEnabled:
            process.env.CA_RESEARCH_AREAS_LOG_LOGSTASH_ENABLED || "false",
        logstashHost:
            process.env.CA_RESEARCH_AREAS_LOG_LOGSTASH_HOST || "127.0.0.1",
        logstashPort:
            process.env.CA_RESEARCH_AREAS_LOG_LOGSTASH_PORT || "50001",
        logstashProtocol:
            process.env.CA_RESEARCH_AREAS_LOG_LOGSTASH_PROTOCOL || "udp",
    },
    saltRounds: process.env.CA_RESEARCH_AREAS_SALT_ROUNDS || "10",
    services: {
        ad: {
            prefix:
                process.env.CA_RESEARCH_AREAS_AD_SERVICE_PREFIX ||
                "/api/v1/in/",
            host:
                process.env.CA_RESEARCH_AREAS_AD_SERVICE_HOST ||
                "http://127.0.0.1",
            port: process.env.CA_RESEARCH_AREAS_AD_SERVICE_PORT || "6801",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
        mail: {
            prefix:
                process.env.CA_RESEARCH_AREAS_MAIL_SERVICE_PREFIX ||
                "/api/v1/in/mail",
            host:
                process.env.CA_RESEARCH_AREAS_MAIL_SERVICE_HOST ||
                "http://127.0.0.1",
            port: process.env.CA_RESEARCH_AREAS_MAIL_SERVICE_PORT || "6803",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
        file: {
            prefix:
                process.env.CA_RESEARCH_AREAS_FILE_SERVICE_PREFIX ||
                "/api/v1/in/files",
            host:
                process.env.CA_RESEARCH_AREAS_FILE_SERVICE_HOST ||
                "http://127.0.0.1",
            port: process.env.CA_RESEARCH_AREAS_FILE_SERVICE_PORT || "6802",
            getUrl: function (): string {
                return `${this.host}:${this.port}${this.prefix}`;
            },
        },
    },
};

configs.keys.checkSecretKeyPublicKey();
