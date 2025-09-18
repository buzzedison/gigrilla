# Fan Profile System

## Overview
Gigrilla's user system is built around Fan profiles as the foundation, with optional Industry profiles that can be added later. All users start as Basic Fans and can upgrade to Full Fans or add specialized Industry profiles.

## Account Types

### Basic Fan (Default Signup)
**Required Fields:**
- First Name
- Last Name  
- Email
- Password

**Capabilities:**
- ✅ Browse website and use search functionality
- ✅ RSVP to invites from Full Fan profiles
- ❌ Cannot stream/download music
- ❌ Cannot create playlists or select favorites
- ❌ Cannot add reviews or use location services
- ❌ Cannot earn money or buy tickets/merchandise
- ❌ Cannot comment/like/share or message users

**User Experience:**
- No public profile or control panel
- 'My Gigrilla' / 'Control Panel' links redirect to upgrade page
- Functions as guest-level access

### Full Fan Profile (Upgrade)
**Additional Required Fields:**
- Username (unique identifier)
- Date of Birth
- Home Address (for location services)
- Mobile/Cell Phone Number (for 2FA & reminders)
- Payment Details (card/bank/PayPal for transactions)

**Capabilities:**
- ✅ All Basic Fan features
- ✅ Stream/download music and create playlists
- ✅ Select favorites and add reviews
- ✅ Use location services
- ✅ Earn money and buy tickets/merchandise
- ✅ Comment/like/share and message users
- ✅ Access to full control panel

## Industry Profiles (Extensions of Full Fan)

Full Fan profiles enable creation of specialized Industry profiles:

### Artist Profiles
- **Quantity:** 1 Fan can have multiple Artist profiles
- **Visibility:** Public once published
- **Admin System:** Various admin levels can be assigned to other Fan profiles
- **Fields:** Stage Name, Members, Bio, Established Date, Genres, Base Location, etc.

### Venue Profiles  
- **Quantity:** 1 Fan can have multiple Venue profiles
- **Visibility:** Public once published
- **Admin System:** Various admin levels for employees/managers
- **Fields:** Public Venue Name + Address, Company Details, Team Members, Bio, Capacity, etc.

### Music Service Profiles (Organizations)
- **Quantity:** 1 Fan can have multiple Service profiles
- **Purpose:** For business transactions
- **Visibility:** Public once published
- **Admin System:** Various admin levels for employees
- **Fields:** Brand Name, Company Details, Team Members, Bio, Services, etc.

### Music Pro Profiles (Individuals)
- **Quantity:** 1 Fan can have ONLY 1 Pro profile
- **Purpose:** For advice/networking
- **Visibility:** Public once published
- **Dependency:** Must have published Music Service Profile (unless set to 'Retired')
- **Association Tags:** Employed, Freelance, Independent, Retired

## Technical Implementation

### Database Schema
- `users` table: Core user data (email, names, role)
- `user_profiles` table: Extended profile data by type
- Profile types: 'fan', 'artist', 'venue', 'service', 'pro'

### Authentication Flow
1. User signs up as Basic Fan (minimal required fields)
2. Account created with `user_role: 'fan'` and `account_type: 'guest'`
3. User can upgrade to Full Fan later (adds profile data)
4. Industry profiles can be added after Full Fan upgrade

### Messaging & Commerce
- **Messaging:** Users can message using either Fan profile or Industry profile identity
- **Contracts:** All legal agreements require Full Fan profile personal details for binding contracts
- **Admin Permissions:** Fan profiles can be granted admin access to Industry profiles

## User Journey
1. **Signup:** Basic Fan (email, password, name only)
2. **Browse:** Limited guest-level access
3. **Upgrade:** Full Fan profile for complete features  
4. **Specialize:** Add Industry profiles as needed
5. **Collaborate:** Invite other fans as admins to Industry profiles