# BugDex - EdgeOne Pages 部署版本

## 🚀 测试账号（立即可用）

由于 KV 存储权限暂时未申请，我们提供了测试账号：

### **预设测试账号**
- **管理员账号**：`admin` / `admin123`
- **测试账号**：`test` / `test123`

### **功能特点**
- ✅ **立即可用**：无需注册，直接登录测试
- ✅ **完整功能**：所有功能都可以正常使用
- ✅ **双重存储**：优先使用内存存储，KV 可用时自动同步
- ✅ **向后兼容**：KV 存储申请通过后无缝升级

## 项目结构
```
bugdex-edgeone/
├── index.html          # 前端页面
├── script.js           # 前端逻辑
├── style.css           # 样式文件
├── api/
│   ├── auth.js         # 认证相关 API
│   ├── posts.js        # 帖子相关 API
│   └── users.js        # 用户相关 API
├── edgeone.json        # EdgeOne 配置
└── README.md           # 说明文档
```

## 🚀 快速部署（无需 KV 存储）

如果你还没有申请到 KV 存储，可以使用临时内存存储版本：

### 1. 推送代码到 Git
```bash
git add .
git commit -m "Add test accounts and dual storage support"
git push origin main
```

### 2. 在 EdgeOne Pages 中创建项目
1. 访问 https://pages.edgeone.ai/
2. 创建新项目
3. 连接 Git 仓库
4. **跳过 KV 存储配置**（暂时不需要）

### 3. 配置环境变量
只需要配置一个环境变量：
```
JWT_SECRET=your_jwt_secret_key_here
```

### 4. 部署项目
- 等待自动部署完成
- 或者手动触发部署

### 5. 测试功能
- ✅ 使用测试账号登录：`admin` / `admin123`
- ✅ 发布帖子
- ✅ 点赞和评论
- ✅ 用户中心
- ✅ 每周排行榜
- ✅ 注册新用户（需要验证码）

## 📝 临时版本说明

### 功能特性
- ✅ **完整功能**：所有功能都可以正常使用
- ✅ **双重存储**：内存存储 + KV 存储（如果可用）
- ✅ **测试账号**：提供预设账号直接测试
- ✅ **向后兼容**：KV 存储申请通过后自动升级
- ✅ **无需配置**：不需要任何外部服务

### 限制说明
- ⚠️ **数据不持久**：服务器重启后内存数据会丢失
- ⚠️ **仅用于测试**：不建议用于生产环境
- ⚠️ **单实例**：多个实例之间数据不共享

## 🔄 升级到正式版本

当你的 KV 存储申请通过后，可以升级到正式版本：

### 1. 配置 KV 存储
- 创建命名空间：`bugdex_data`
- 绑定变量：`bugdex_kv`

### 2. 配置邮件服务
选择一种邮件服务进行配置

### 3. 自动升级
代码会自动检测 KV 存储可用性，无需修改代码

## 环境变量配置

在 EdgeOne Pages 项目设置中配置以下环境变量：

### 必需环境变量
- `JWT_SECRET`: JWT 密钥（任意字符串，用于生成登录令牌）

### 邮件服务环境变量（可选）
如果你想启用真正的邮件发送功能，需要配置以下变量：

#### 方案一：SendGrid（推荐）
- `SENDGRID_API_KEY`: SendGrid API 密钥
- `SENDGRID_FROM_EMAIL`: 发件人邮箱地址

#### 方案二：Resend
- `RESEND_API_KEY`: Resend API 密钥
- `RESEND_FROM_EMAIL`: 发件人邮箱地址

## 部署步骤

1. 将代码推送到 Git 仓库
2. 在 EdgeOne Pages 中创建新项目
3. 连接 Git 仓库
4. 配置环境变量（至少需要 JWT_SECRET）
5. 部署项目

## KV 存储配置（正式版本）

在 EdgeOne Pages 的 KV 管理页面：
- 变量名称：`bugdex_kv`
- 命名空间：`bugdex_data`

## 功能特性

- ✅ 用户注册/登录（支持测试账号）
- ✅ 邮件验证码（支持多种邮件服务）
- ✅ 发布帖子
- ✅ 点赞功能
- ✅ 评论功能
- ✅ 用户中心
- ✅ 每周排行榜
- ✅ 响应式设计
- ✅ 现代化 UI

## 邮件服务设置指南

### SendGrid 设置步骤：

1. **注册 SendGrid 账号**
   - 访问 https://sendgrid.com/
   - 注册免费账号
   - 验证邮箱地址

2. **获取 API Key**
   - 登录 SendGrid 控制台
   - 进入 Settings > API Keys
   - 创建新的 API Key（选择 "Restricted Access" > "Mail Send"）
   - 复制 API Key

3. **验证发件人邮箱**
   - 进入 Settings > Sender Authentication
   - 验证你的邮箱地址

4. **配置环境变量**
   - `SENDGRID_API_KEY`: 你的 API Key
   - `SENDGRID_FROM_EMAIL`: 已验证的邮箱地址

### Resend 设置步骤：

1. **注册 Resend 账号**
   - 访问 https://resend.com/
   - 注册免费账号

2. **获取 API Key**
   - 登录后复制 API Key

3. **配置环境变量**
   - `RESEND_API_KEY`: 你的 API Key
   - `RESEND_FROM_EMAIL`: 你的邮箱地址

## 注意事项

- 免费邮件服务通常有发送限制
- 建议在开发阶段使用模拟发送
- 生产环境建议使用付费邮件服务
- 确保发件人邮箱已通过验证
- 临时版本数据不会持久化，仅用于测试
- 预设账号仅用于测试，生产环境请删除 