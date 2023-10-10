import "dotenv/config";

export const configs = {
    service: "mail",
    environment: process.env.CA_MAIL_ENVIRONMENT || "dev",
    app: {
        prefix: "/api/v1",
        host: process.env.CA_MAIL_HOST_NAME || "0.0.0.0",
        port: process.env.CA_MAIL_PORT_NUMBER || "6803",
    },
    redis: {
        host: process.env.CA_MAIL_REDIS_HOST || "127.0.0.1",
        port: process.env.CA_MAIL_REDIS_PORT || "6380",
        username: process.env.CA_MAIL_REDIS_USERNAME || "",
        password: process.env.CA_MAIL_REDIS_PASSWORD || "",
    },
    mail: {
        user: process.env.CA_USER_MAIL_SERVER || "",
        pass: process.env.CA_PASS_MAIL_SERVER || "",
        host: process.env.CA_HOST_MAIL_SERVER || "",
        port: process.env.CA_PORT_MAIL_SERVER || "",
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
    log: {
        logFileEnabled: process.env.CA_MAIL_LOG_FILE_ENABLED || "false",
        folderLogsPath:
            process.env.CA_MAIL_FOLDER_LOGS_PATH || `${__dirname}/../../logs`,

        logstashEnabled: process.env.CA_MAIL_LOG_LOGSTASH_ENABLED || "false",
        logstashHost: process.env.CA_MAIL_LOG_LOGSTASH_HOST || "127.0.0.1",
        logstashPort: process.env.CA_MAIL_LOG_LOGSTASH_PORT || "50001",
        logstashProtocol: process.env.CA_MAIL_LOG_LOGSTASH_PROTOCOL || "udp",
    },
    services: {},
};
