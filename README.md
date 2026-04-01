# Halo Attachment Tools

一个用于 [Halo](https://halo.run) 平台的附件批量上传工具，支持图片压缩、格式转换和自定义重命名。

## 功能特性

- **多种认证方式** - 支持 PAT (Personal Access Token) 和 Basic Auth （用户名密码）两种认证方式
- **批量上传** - 支持拖拽上传、多文件批量上传
- **图片压缩** - 上传前自动压缩图片，可配置压缩质量、最大宽高
- **格式转换** - 支持将图片转换为 WebP 格式，减小文件体积
- **文件重命名** - 支持多种重命名模板（UUID、时间戳、随机字符等）
- **存储策略管理** - 支持选择存储策略和分组，可快速创建新的策略和分组
- **安全存储** - 认证信息本地加密存储，支持会话级和持久化存储

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 框架**: Tailwind CSS + DaisyUI
- **HTTP 客户端**: Axios
- **图标**: Iconify

## 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置加密密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_ENCRYPTION_KEY=your-encryption-key-here
```

> 加密密钥用于本地存储的认证信息加密，建议使用随机生成的 32 字符以上字符串。

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 使用说明

### 1. 配置站点连接

首次使用需要配置 Halo 站点连接信息：

1. 点击「配置连接」按钮
2. 输入站点地址（如 `https://your-halo-site.com`）
3. 选择认证方式：
   - **PAT 认证**：使用 Halo 后台生成的个人访问令牌
   - **Basic Auth**：使用用户名和密码
4. 点击「测试连接」验证配置
5. 勾选「记住认证信息」可保存配置到本地

### 2. 选择存储策略和分组

- **存储策略**：选择文件上传的目标存储策略
- **分组**：选择文件所属的分组（可选）

### 3. 添加文件

支持以下方式添加文件：

- 点击上传区域选择文件
- 拖拽文件到上传区域
- 支持多选

### 4. 配置处理选项

#### 文件重命名

支持以下重命名模板变量：

| 变量                         | 说明         | 示例                                     |
| -------------------------- | ---------- | -------------------------------------- |
| `${origin-filename}`       | 原始文件名      | `image`                                |
| `${uuid-with-dash}`        | UUID（带连字符） | `550e8400-e29b-41d4-a716-446655440000` |
| `${uuid-no-dash}`          | UUID（无连字符） | `550e8400e29b41d4a716446655440000`     |
| `${timestamp-sec}`         | 秒级时间戳      | `1703001600`                           |
| `${timestamp-ms}`          | 毫秒级时间戳     | `1703001600000`                        |
| `${year}`                  | 年份         | `2024`                                 |
| `${month}`                 | 月份         | `12`                                   |
| `${day}`                   | 日期         | `20`                                   |
| `${hour}`                  | 小时         | `10`                                   |
| `${minute}`                | 分钟         | `30`                                   |
| `${second}`                | 秒          | `45`                                   |
| `${random-alphabetic:X}`   | X 位随机字母    | `abc`                                  |
| `${random-num:X}`          | X 位随机数字    | `123`                                  |
| `${random-alphanumeric:X}` | X 位随机字母数字  | `a1b2`                                 |

#### 图片格式转换

- 开启后将图片转换为 WebP 格式
- 可配置转换质量（1-100）
- 可配置最大并发数

#### 图片压缩

- 开启后自动压缩图片
- 可配置压缩质量（1-100）
- 可配置最大宽高限制
- 可选择是否保留原始格式

### 5. 开始上传

点击「开始上传」按钮，等待上传完成。上传过程中会显示进度条和状态信息。

## 项目结构

```
src/
├── api/                  # API 服务
│   ├── core/             # 核心 API
│   ├── modules/          # 模块 API
│   ├── halo.ts
│   └── index.ts
├── components/           # 组件
│   ├── features/         # 功能组件
│   │   ├── auth/         # 认证相关组件
│   │   ├── group/        # 分组相关组件
│   │   ├── policy/       # 策略相关组件
│   │   └── upload/       # 上传相关组件
│   ├── ui/               # UI 基础组件
│   └── index.ts
├── composables/          # 组合式函数
│   ├── auth/             # 认证相关
│   ├── file/             # 文件处理相关
│   ├── upload/           # 上传相关
│   └── index.ts
├── constants/            # 常量定义
├── layouts/              # 布局组件
├── stores/               # Pinia 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
├── views/                # 页面视图
├── App.vue
├── index.ts
├── main.ts
├── style.css
└── vite-env.d.ts
```

## 脚本命令

| 命令               | 说明              |
| ---------------- | --------------- |
| `pnpm dev`       | 启动开发服务器         |
| `pnpm build`     | 构建生产版本          |
| `pnpm preview`   | 预览生产版本          |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint`      | ESLint 代码检查     |
| `pnpm lint:fix`  | ESLint 自动修复     |

## 注意事项

1. **认证信息安全**：认证信息使用 AES-GCM 算法加密后存储在本地
2. **文件大小限制**：图片压缩功能最大支持 50MB 的文件
3. **图片尺寸限制**：图片压缩功能最大支持 10000x10000 像素的图片

