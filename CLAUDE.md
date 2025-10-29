# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program for personality testing (人格测试微信小程序) that implements the Big Five personality test (大五人格测试). The app uses WeChat Cloud Development for backend services and TDesign for UI components.

## Architecture

### Core Structure
- **App Entry**: `app.js` - Initializes cloud development, theme, and global state
- **Pages**: Standard WeChat Mini Program pages in `pages/` directory
- **Utils**: Shared utilities and services in `utils/` directory
- **Cloud Functions**: Backend logic in `cloudfunctions/` directory
- **Configuration**: Environment settings in `utils/config.js`

### Key Components

**Global App Management**:
- Cloud development initialization with environment ID `cloud1-7g80w0g6e3f866b7`
- TDesign theme configuration with consistent color scheme
- User authentication state management
- Global logout functionality

**Page Structure**:
- `index`: Homepage with test overview and recent results
- `test`: Personality test questionnaire
- `result`: Test results and analysis
- `history`: Test history tracking
- `profile`: User profile management
- `edit-profile`: Profile editing
- `agreement/privacy`: Legal pages

**Services**:
- `TestService`: Handles test result validation and cloud storage
- `wechat-auth.js`: WeChat authentication flow
- `cloud-auth.js`: Cloud-based authentication
- `ai-api.js`: AI analysis integration
- Test calculators for MBTI and Belbin assessments

**Cloud Functions**:
- `userLogin`: User authentication
- `updateUserInfo`: Profile management
- `saveTestResult`: Result persistence
- `getUserTestHistory`: History retrieval

### Data Flow
1. User authentication through WeChat → Cloud function creates/updates user
2. Test completion → Local calculation → Cloud storage via TestService
3. Results displayed → Stored in history → Profile aggregation

## Development Commands

### WeChat Developer Tools
- Open project in WeChat Developer Tools IDE
- Use "Build" (编译) to compile the project
- Use "Preview" (预览) to test on device
- Use "Debug" (调试) for console output inspection

### NPM Dependencies
```bash
npm install
```

### Cloud Functions
Each cloud function has its own `package.json` and can be deployed individually through the WeChat Developer Tools cloud console.

## Configuration

### Environment Setup
- Development mode: Set `isDevelopment = true` in `utils/config.js`
- Mock AI: Enabled in development (`useMockAI: true`)
- Debug mode: Console logging enabled in development

### WeChat App Configuration
- AppID: `wx13be55eec0e0bc2c` (configured in `project.config.json`)
- Cloud environment: `cloud1-7g80w0g6e3f866b7`
- Location permissions requested for user positioning

### TDesign Theme
Custom light theme defined in `app.js` with brand color `#0052D9` and consistent component styling.

## Key Implementation Details

### Test Data Validation
The `TestService` enforces strict validation for Big Five personality scores:
- All five dimensions (openness, conscientiousness, extraversion, agreeableness, neuroticism) must be present
- Scores must be numbers between 0-100
- Validation occurs before cloud storage

### State Management
- Global app state managed through `app.globalData`
- User session stored in `wx.getStorageSync('userInfo')`
- Login codes managed separately from user info

### Data Persistence
- Test results stored in cloud database via cloud functions
- Local storage used for user session and temporary data
- Automatic cleanup of legacy test data formats on app launch

## WeChat Mini Program Specifics

### Component Usage
- TDesign components imported via npm in `miniprogram_npm/`
- Custom components registered in page configurations
- Tab bar configured in `app.json`

### Cloud Development
- Uses WeChat Cloud Development for database and functions
- Authentication integrated with WeChat user system
- Real-time database operations through cloud functions

### Navigation
- Tab bar navigation for main sections (首页/历史/我的)
- Modal navigation for test flow and editing
- Deep linking support for result sharing