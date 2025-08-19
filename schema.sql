-- D1 Database Schema for Request Logs
CREATE TABLE IF NOT EXISTS http_request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL,
    headers TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip TEXT NOT NULL,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_host ON http_request_logs(host);
CREATE INDEX IF NOT EXISTS idx_timestamp ON http_request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ip ON http_request_logs(ip);
CREATE INDEX IF NOT EXISTS idx_method ON http_request_logs(method);
