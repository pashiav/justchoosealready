# 𓌉◯𓇋 JUST CHOOSE ALREADY

> Tired of your friends never knowing what to eat? Wanting them to *JUST CHOOSE ALREADY*?

A restaurant decision-making web application that spins a wheel to help indecisive groups finally pick a place to eat. Built with modern web technologies and available in both free and premium tiers.

### Why I Built This
I am the indecisive girlfriend who never knows where to eat.

After putting my partner through this torture many times, I figured there had to be a better way. Now when I say "I don't care, you choose," we can just spin the wheel.


## Features

### Core Functionality
- **Interactive Restaurant Wheel**: Spin to randomly select from nearby restaurants
- **Smart Location Search**: Find restaurants within a 25-mile radius
- **Cuisine Filtering**: Filter by 17+ different cuisine types
- **User Authentication**: Secure Google OAuth login
- **Favorites System**: Save and manage your favorite restaurants
- **Spin History**: Track all your previous spins and selections
- **Mobile Responsive**: Optimized for all devices and screen sizes

### Free vs Premium Accounts

| Feature | ⮕ Free Account | ★ Premium Account |
|---------|-------------|-----------------|
| **Restaurant Search** | OpenStreetMap API | Google Places API |
| **Search Accuracy** | Basic location matching | High-precision location matching |
| **Restaurant Data** | Limited (name, address only) | Comprehensive (ratings, photos, price levels, reviews) |
| **Location Autocomplete** | Basic geocoding | Advanced Google Places autocomplete |
| **Search Radius** | Up to 25 miles | Up to 25 miles |
| **Cuisine Filtering** | 17+ cuisine types | 17+ cuisine types |
| **Price Filtering** | ✘ Not available | Price level indicators (\$, $$, $$$, $$$$) |
| **Rating Information** | ✘ Not available | Star ratings and review counts |
| **User Authentication** | Google OAuth | Google OAuth |
| **Favorites System** | Save/remove favorites | Save/remove favorites |
| **Spin History** | Track all spins | Track all spins |
| **Wheel Spinning** | Full functionality | Full functionality |
| **Mobile Responsiveness** | Optimized for all devices | Optimized for all devices |
| **API Rate Limits** | OpenStreetMap limits | Google API quota limits |
| **Data Freshness** | Limited real-time updates | Real-time Google Places data |
| **Search Performance** | Slower (fallback API) | Faster (primary API) |
| **Location Precision** | Basic coordinate accuracy | High-precision coordinates |
| **Address Formatting** | Basic formatting | Google's standardized formatting |

### Account Tier Benefits

**Free Account Benefits:**
- No cost or subscription required
- Access to core functionality (wheel spinning, favorites, basic search)
- No API rate limit concerns with OpenStreetMap
- Full access to decision-making features

**Premium Account Benefits:**
- Rich restaurant data (ratings, price levels)
- Better search accuracy and location precision
- Advanced autocomplete and search suggestions
- Professional-grade restaurant information
- Faster search performance

**Shared Features:**
- Core wheel spinning functionality
- User authentication and profiles
- Favorites and history tracking
- Responsive design and mobile optimization
- All UI components and animations

The free tier provides a fully functional decision-making tool, while the premium tier enhances the experience with comprehensive restaurant data and improved search capabilities.

## Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom components
- **Database**: Supabase (PostgreSQL)
- **APIs**: 
  - Google Places API (Premium)
  - OpenStreetMap API (Free tier)
- **Deployment**: Next.js with Turbopack

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Google Cloud Platform account (for premium features)
- Google OAuth credentials
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pashiav/justchoosealready.git
cd justchoosealready
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Set up your Supabase database using the schema in `supabase-schema.sql`

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

#### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

#### Google Maps & Places API Setup
1. Enable Google Maps JavaScript API
2. Enable Google Places API
3. Create an API key with appropriate restrictions
4. Set up billing (required for Google Places API)

#### Supabase Setup
1. Create a new Supabase project
2. Run the SQL commands from `supabase-schema.sql`
3. Configure Row Level Security (RLS) policies
4. Get your project URL and anon key

## Usage

### Basic Usage
1. Sign in with your Google account
2. Enter your location or allow location access
3. Select cuisine preferences (optional)
4. Set search radius (up to 25 miles)
5. Spin the wheel and let fate decide!

### Advanced Features (Premium)
- Filter by price range
- View restaurant ratings and reviews
- Get detailed restaurant information

## API Reference

### Restaurant Search
- **Free Tier**: Uses OpenStreetMap Nominatim API for basic restaurant data
- **Premium Tier**: Uses Google Places API for comprehensive restaurant information

## Architecture

### Database Schema
- **Users**: Authentication and Google API access control
- **Spins**: User spin history and results
- **Favorites**: User-saved restaurant preferences
- **Places Cache**: Temporary storage for API results
<img width="400" height="587" alt="schema" src="https://github.com/user-attachments/assets/cfb7fe33-8f41-4090-a926-084b1b36ea5e" />

### API Routes
- `/api/auth/*`: NextAuth.js authentication
- `/api/search`: Restaurant search with fallback logic
- `/api/favorites`: User favorites management
- `/api/spin`: Spin result tracking
- `/api/geocode`: Location geocoding service

### State Management
- Zustand store for wheel state, filters, and user selections
- React hooks for component state and side effects
- Optimistic updates for better user experience

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
src/
  app/            # Next.js app router pages
  components/     # React components
  lib/            # Utilities and configurations
```

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/pashiav/justchoosealready/issues)
