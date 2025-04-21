-- Organizations table to track different organizations
CREATE TABLE organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for organizations table
CREATE TRIGGER update_organizations_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for users table
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Organization memberships
CREATE TABLE organization_members (
  organization_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (organization_id, user_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger for organization_members table
CREATE TRIGGER update_organization_members_timestamp
BEFORE UPDATE ON organization_members
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- File system nodes (both files and folders)
CREATE TABLE fs_nodes (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('file', 'folder')),
  parent_id VARCHAR(36),
  path TEXT NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES fs_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Trigger for fs_nodes table
CREATE TRIGGER update_fs_nodes_timestamp
BEFORE UPDATE ON fs_nodes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Indexes for fs_nodes
CREATE INDEX idx_fs_nodes_org_parent ON fs_nodes(organization_id, parent_id);
CREATE INDEX idx_fs_nodes_path ON fs_nodes(path);
CREATE INDEX idx_fs_nodes_deleted_at ON fs_nodes(deleted_at);

-- File contents (separated for performance)
CREATE TABLE file_contents (
  file_id VARCHAR(36) PRIMARY KEY,
  content TEXT,
  version INT NOT NULL DEFAULT 1,
  FOREIGN KEY (file_id) REFERENCES fs_nodes(id) ON DELETE CASCADE
);

-- File version history
CREATE TABLE file_versions (
  id VARCHAR(36) PRIMARY KEY,
  file_id VARCHAR(36) NOT NULL,
  content TEXT,
  version INT NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES fs_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE (file_id, version)
);

-- File access logs
CREATE TABLE fs_access_logs (
  id VARCHAR(36) PRIMARY KEY,
  node_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'rename', 'move')),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES fs_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for logs
CREATE INDEX idx_logs_node_timestamp ON fs_access_logs(node_id, timestamp);
CREATE INDEX idx_logs_user_timestamp ON fs_access_logs(user_id, timestamp);
