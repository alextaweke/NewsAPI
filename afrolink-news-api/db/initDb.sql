CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('author', 'reader');

CREATE TABLE user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ENUM('Draft', 'Published') DEFAULT 'Draft',
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_author_id (author_id),
    INDEX idx_status_deleted (status, deleted_at),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    CHECK (CHAR_LENGTH(title) >= 1),
    CHECK (CHAR_LENGTH(content) >= 50)
);






