# Attendance App Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app uses company credentials with backend API integration.

**Implementation:**
- Email/password login (username: "superadmin", password: "aA@123")
- API endpoint: `localhost:8080/api/auth/login`
- Token-based authentication stored securely in AsyncStorage
- Token must be included in Authorization header for all subsequent API calls
- No SSO required for this enterprise attendance system

### Navigation
**Tab Navigation** - 5 tabs with center floating action button

**Tab Structure:**
1. **Home** (left) - Dashboard with greeting, date, location, stats
2. **Analytics** (left-center) - Placeholder for future analytics
3. **Clock In/Out** (center, elevated button) - Primary action with camera
4. **Leave** (right-center) - Placeholder for leave management  
5. **Settings/Profile** (right) - User profile and app settings

### Screen Specifications

#### 1. Login Screen
- **Purpose:** Authenticate user with company credentials
- **Layout:**
  - No header
  - Logo at top (company branding)
  - Form fields: Username and Password with labels
  - Primary green login button below form
  - White background with centered content
  - Top inset: insets.top + Spacing.xl, Bottom inset: insets.bottom + Spacing.xl
- **Components:** Text inputs with labels, submit button
- **Form:** Submit button below form fields (full width, green)

#### 2. Home Dashboard
- **Purpose:** Display attendance overview and quick stats
- **Layout:**
  - Custom header with:
    - Greeting text "Good Morning, [Name]" (large, bold)
    - Current date below greeting (gray text)
    - Location pin icon with office location
    - Bell notification icon (top right)
  - Main content (scrollable):
    - Check Status card (green if checked in, showing time)
    - Statistics grid: Check In, Check Out, Break Time, Total Hours
    - Recent activity or quick actions
  - Transparent header
  - Top inset: headerHeight + Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl
- **Components:** Status cards, stat grid, greeting header

#### 3. Clock In/Out Camera Screen
- **Purpose:** Capture facial recognition for attendance
- **Layout:**
  - Full-screen camera view
  - Oval/circular face guide overlay in center
  - Instruction text at top: "Please Look at the Camera and Hold Still"
  - Close button (top left, white)
  - Bottom inset: insets.bottom + Spacing.xl (no tab bar on camera)
- **Components:** Camera preview, face detection overlay, instruction text
- **Note:** Modal screen (not in tab stack)

#### 4. Attendance History
- **Purpose:** View attendance records by date
- **Layout:**
  - Header with title "Attendance History"
  - Calendar month view showing current month
  - Date indicators (green dots for present days)
  - Scrollable list of attendance records below calendar
  - Each record shows: Date, Check In time, Check Out time, Total hours
  - Top inset: headerHeight + Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl
- **Components:** Calendar component, list of attendance records

#### 5. Profile/Settings Screen
- **Purpose:** Display user details and app settings
- **Layout:**
  - Header with "Profile" title
  - Avatar placeholder at top
  - User info: Name, Employee ID, Department, Email
  - API endpoint: `localhost:8080/api/profile/detail`
  - Settings options below
  - Top inset: headerHeight + Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl
- **Components:** Avatar, info cards, settings list

## Design System

### Color Palette
**Primary Colors:**
- Primary Green: `#4CAF50` or similar vibrant green (from templates)
- Background White: `#FFFFFF`
- Card Background: `#F5F5F5` (light gray)
- Text Primary: `#333333`
- Text Secondary: `#757575`
- Success/Active: Same as Primary Green
- Border/Divider: `#E0E0E0`

### Typography
- **Headers:** Bold, 24-28pt for greetings, 20pt for screen titles
- **Body:** Regular, 16pt for main content
- **Labels:** Medium, 14pt for form labels and stat labels
- **Secondary:** Regular, 14pt, gray color for dates/subtitles
- **Button Text:** Medium/Semibold, 16pt

### Visual Design
- **Buttons:**
  - Primary button: Green background, white text, rounded corners (8-12px), full width or prominent
  - Visual feedback: Slight opacity change on press
- **Cards:**
  - White background with subtle shadow
  - Rounded corners (12-16px)
  - Padding: Spacing.lg internally
  - Margin: Spacing.md between cards
- **Status Indicators:**
  - Green pill/badge for "Checked In" status
  - Show time with clock icon
- **Statistics Grid:**
  - 2x2 grid layout
  - Each stat in its own card
  - Icon + value + label format
- **Tab Bar:**
  - Center button elevated above tab bar
  - Green background for center button
  - Icons for each tab (Feather icons)
  - Active state: green tint, inactive: gray

### Critical Assets
1. **Company Logo** - For login screen header
2. **Face Detection Overlay** - Oval guide for camera screen (can be SVG/vector)
3. **Icons Required:**
   - Home icon
   - Analytics/chart icon
   - Camera icon (center button)
   - Leave/calendar icon
   - Settings/profile icon
   - Bell notification icon
   - Location pin icon
   - Clock icons for check in/out stats

### Accessibility
- Minimum touch target: 44x44pt
- High contrast between text and backgrounds
- Clear error messages for failed API calls
- Loading states for all API interactions
- Camera permissions handling with clear messaging