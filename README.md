# 0G Labs Quiz Application

A dynamic quiz application that tests knowledge about 0G Labs and zero-knowledge proof technology. The app features real-time question generation from latest 0G Labs news, timed quizzes, and a weekly leaderboard.

## 🚀 Features

- **Dynamic Question Generation**: Questions are automatically generated from latest 0G Labs news using AI
- **Timed Quiz System**: 10-second timer per question with auto-skip functionality
- **Real-time Leaderboard**: Weekly leaderboard showing top 100 performers
- **Modern UI**: Beautiful purple/white theme with responsive design
- **Score Tracking**: Comprehensive scoring system with performance analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 for question generation
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 0glabs-quiz
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Question Generation Secret
QUESTION_GENERATION_SECRET=your_secret_key_here
```

### 4. Set Up Supabase Database

1. Create a new Supabase project
2. Run the following SQL to create the required tables:

```sql
-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  answers INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_scores_percentage ON scores(percentage DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── get-questions/ # Get quiz questions
│   │   ├── submit-score/  # Submit quiz results
│   │   ├── leaderboard/   # Get leaderboard data
│   │   └── generate-questions/ # Generate new questions
│   ├── quiz/              # Quiz page
│   ├── results/           # Results page
│   ├── leaderboard/       # Leaderboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility libraries
│   ├── database.ts        # Database operations
│   └── question-generator.ts # Question generation logic
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Question Generation

The app automatically generates questions from 0G Labs news sources:

- **Medium Blog**: RSS feed from 0G Labs Medium
- **Official Blog**: Scraping from 0glabs.io/blog
- **GitHub**: Repository updates (future feature)

Questions are generated using OpenAI GPT-4 and stored in the database.

### Timer System

- Each question has a 10-second timer
- If time runs out, the question is marked as incorrect
- Timer automatically advances to the next question

### Leaderboard System

- Shows top 100 performers for the current week
- Resets every Monday at 00:00 UTC
- Displays rank, name, score, percentage, and date

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Set Up Cron Job for Question Generation

To automatically generate new questions, set up a cron job:

```bash
# Run every 6 hours
0 */6 * * * curl -X GET "https://your-domain.vercel.app/api/generate-questions?secret=your_secret"
```

Or use Vercel Cron Jobs (if available):

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/generate-questions?secret=your_secret",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## 🔒 Security

- API routes are protected with secret keys
- Environment variables are used for sensitive data
- Input validation on all API endpoints
- Rate limiting recommended for production

## 📊 API Endpoints

### GET /api/get-questions
Returns 10 random questions for the quiz.

### POST /api/submit-score
Submits quiz results and calculates score.

**Body:**
```json
{
  "name": "Player Name",
  "score": 8,
  "totalQuestions": 10,
  "answers": [0, 1, null, 2, ...]
}
```

### GET /api/leaderboard
Returns the weekly leaderboard.

**Query Parameters:**
- `limit`: Number of entries to return (default: 100)

### GET /api/generate-questions
Triggers question generation from news sources.

**Query Parameters:**
- `secret`: Secret key for authorization

## 🎨 Customization

### Styling
The app uses Tailwind CSS with a custom purple theme. Modify `tailwind.config.js` to change colors and styling.

### Question Sources
Add or modify news sources in `lib/question-generator.ts`:

```typescript
const NEWS_SOURCES = [
  'https://0glabs.medium.com/feed',
  'https://your-custom-source.com/feed',
  // Add more sources here
];
```

### Timer Duration
Change the timer duration in `app/quiz/page.tsx`:

```typescript
const [timeLeft, setTimeLeft] = useState(15) // Change from 10 to 15 seconds
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Updates

The application automatically updates questions based on latest 0G Labs news. Check back regularly for fresh challenges! 