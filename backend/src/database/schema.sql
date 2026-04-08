-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    emailVerified BOOLEAN DEFAULT FALSE,
    avatar LONGTEXT NULL,
    language VARCHAR(15) DEFAULT 'pt-BR',
    theme VARCHAR(50) DEFAULT 'light',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP NULL,
    isActive BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_createdAt (createdAt)
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    status VARCHAR(50) DEFAULT 'active',
    color VARCHAR(7) DEFAULT '#3498db',
    icon VARCHAR(255) NULL,
    ownerId VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    archivedAt TIMESTAMP NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ownerId (ownerId),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    dueDate TIMESTAMP NULL,
    completedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `order` INT DEFAULT 0,
    userId VARCHAR(36) NOT NULL,
    projectId VARCHAR(36) NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_projectId (projectId),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_dueDate (dueDate),
    INDEX idx_createdAt (createdAt)
);

-- Create Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#95a5a6',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Create Task-Tags Junction Table
CREATE TABLE IF NOT EXISTS task_tags (
    taskId VARCHAR(36) NOT NULL,
    tagId VARCHAR(36) NOT NULL,
    PRIMARY KEY (taskId, tagId),
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Verification queries
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Tasks' as table_name, COUNT(*) as count FROM tasks
UNION ALL
SELECT 'Tags' as table_name, COUNT(*) as count FROM tags;
