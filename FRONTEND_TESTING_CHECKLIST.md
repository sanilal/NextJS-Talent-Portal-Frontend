# Frontend Manual Testing Checklist

Run through this checklist to see what works and what needs to be built.

## Prerequisites
- Backend server running: `php artisan serve` (http://localhost:8000)
- Frontend server running: `npm run dev` (http://localhost:3000)

## 1. Authentication Pages (/login, /register)

### Registration Page
- [ ] Page loads without errors
- [ ] Can see registration form (name, email, password fields)
- [ ] Can select role (Talent/Recruiter)
- [ ] Form validation works
- [ ] Can submit registration
- [ ] Redirects to dashboard after successful registration
- [ ] Shows error messages for invalid input

**Status:** _____________
**Notes:** _____________

### Login Page
- [ ] Page loads without errors
- [ ] Can see login form (email, password fields)
- [ ] Form validation works
- [ ] Can submit login
- [ ] Redirects to dashboard after successful login
- [ ] Shows error messages for invalid credentials
- [ ] "Forgot Password" link visible

**Status:** _____________
**Notes:** _____________

## 2. Dashboard Layout

### Navigation
- [ ] Sidebar/navigation menu visible
- [ ] Logo and branding present
- [ ] User profile dropdown works
- [ ] Logout functionality works
- [ ] Navigation links are clickable

**Status:** _____________

### Role-Based Navigation
- [ ] Talent users see talent-specific menu items
- [ ] Recruiter users see recruiter-specific menu items
- [ ] Menu items navigate to correct pages

**Status:** _____________

## 3. Talent Dashboard Pages

### Profile Page (/dashboard/profile)
- [ ] Page loads without errors
- [ ] Displays current profile information
- [ ] Edit button visible
- [ ] Avatar/photo section visible

**Status:** _____________

### Edit Profile Page (/dashboard/profile/edit)
- [ ] Page loads without errors
- [ ] Form pre-populated with existing data
- [ ] Can edit all profile fields
- [ ] Can upload avatar
- [ ] Save button works
- [ ] Shows success/error messages

**Status:** _____________

### Skills Page (/dashboard/skills)
- [ ] Page loads without errors
- [ ] Displays current skills
- [ ] Can add new skills
- [ ] Can remove skills
- [ ] Can set proficiency level
- [ ] Can reorder skills

**Status:** _____________

### Experience Page (/dashboard/profile/experience)
- [ ] Page loads without errors
- [ ] Displays work experience list
- [ ] Can add new experience
- [ ] Can edit existing experience
- [ ] Can delete experience

**Status:** _____________

### Portfolio Page
- [ ] Can view portfolio items
- [ ] Can add new portfolio items
- [ ] Can upload portfolio images
- [ ] Can edit portfolio items
- [ ] Can delete portfolio items

**Status:** _____________

### Applications Page (/dashboard/applications)
- [ ] Page loads without errors
- [ ] Displays list of applications
- [ ] Shows application status
- [ ] Can view application details
- [ ] Can withdraw applications

**Status:** _____________

## 4. Projects Pages

### Browse Projects (/projects)
- [ ] Page loads without errors
- [ ] Displays list of projects
- [ ] Can see project cards with details
- [ ] Pagination works
- [ ] Search/filter works
- [ ] Can click to view project details

**Status:** _____________

### Project Detail Page (/projects/[id])
- [ ] Page loads without errors
- [ ] Displays full project details
- [ ] Shows required skills
- [ ] Shows budget and duration
- [ ] Apply button visible (for talents)
- [ ] Edit/Delete buttons visible (for owner)

**Status:** _____________

### Apply to Project (/projects/[id]/apply)
- [ ] Page loads without errors
- [ ] Shows application form
- [ ] Can write cover letter
- [ ] Can submit application
- [ ] Shows success message
- [ ] Redirects appropriately

**Status:** _____________

### Create Project (/dashboard/projects/create)
- [ ] Page loads without errors (recruiters only)
- [ ] Shows project creation form
- [ ] Can fill all required fields
- [ ] Can select required skills
- [ ] Can set budget
- [ ] Can submit project
- [ ] Shows success/error messages

**Status:** _____________

## 5. Recruiter Dashboard Pages

### Recruiter Dashboard (/dashboard/recruiter)
- [ ] Page loads without errors
- [ ] Shows dashboard overview
- [ ] Displays active projects
- [ ] Shows application count
- [ ] Quick actions available

**Status:** _____________

### Browse Talents (/dashboard/talents)
- [ ] Page loads without errors
- [ ] Displays list of talents
- [ ] Can see talent cards with skills
- [ ] Search/filter works
- [ ] Can click to view talent details

**Status:** _____________

### Talent Detail Page (/talents/[id])
- [ ] Page loads without errors
- [ ] Displays full talent profile
- [ ] Shows skills with proficiency
- [ ] Shows experience
- [ ] Shows portfolio
- [ ] Contact button visible (for recruiters)

**Status:** _____________

### My Projects (/dashboard/projects)
- [ ] Page loads without errors
- [ ] Displays recruiter's projects
- [ ] Can filter by status
- [ ] Can view applications per project
- [ ] Edit/delete buttons work

**Status:** _____________

## 6. Messaging System (/dashboard/messages)

- [ ] Page loads without errors
- [ ] Shows conversation list
- [ ] Can see message threads
- [ ] Can send new messages
- [ ] Can reply to messages
- [ ] Unread message indicators work
- [ ] Real-time updates (if implemented)

**Status:** _____________

## 7. Settings Page (/dashboard/settings)

- [ ] Page loads without errors
- [ ] Can change password
- [ ] Can update email preferences
- [ ] Can enable/disable 2FA
- [ ] Can manage sessions
- [ ] Can delete account

**Status:** _____________

## 8. Search & AI Features

### Talent Search
- [ ] Search by skills works
- [ ] Search by location works
- [ ] Search by experience level works
- [ ] AI recommendations visible
- [ ] Results are relevant

**Status:** _____________

### Project Matching
- [ ] AI suggests relevant projects to talents
- [ ] Matching score displayed
- [ ] Can view matched projects

**Status:** _____________

## Summary

### Working Features
List what's fully functional:
1. _____________
2. _____________
3. _____________

### Partially Working Features
List what needs fixes:
1. _____________
2. _____________
3. _____________

### Not Working / Not Built
List what needs to be built:
1. _____________
2. _____________
3. _____________

### Priority Items
What should be built next:
1. _____________
2. _____________
3. _____________
