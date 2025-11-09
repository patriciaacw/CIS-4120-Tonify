# Tonify - Tone Analysis for Text Communication

Tonify is an iMessage add-in app that detects and clarifies tone in text messages to help reduce miscommunication, particularly for neurodivergent users.

## Project Information

- **Course**: CIS 4120 - Human-Computer Interaction
- **Team Members**: Patricia Columbia-Walsh, Mehak Dhaliwal, Riya Agrawal
- **Assignment**: A5 - Implementation Prototypes

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)
- A Firebase account
- An OpenAI API key

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/patriciaacw/CIS-4120-Tonify.git
cd CIS-4120-Tonify
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Realtime Database**:
   - Navigate to Build → Realtime Database
   - Click "Create Database"
   - Choose your preferred location
   - Start in "Test mode" (for development)
4. Register a web app:
   - Click the gear icon (⚙️) → Project settings
   - Scroll to "Your apps" and click the web icon (`</>`)
   - Register your app and copy the configuration values

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```bash
touch .env
```

Add your Firebase configuration (replace with your actual values):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Set Up OpenAI API Key (For Tone Analysis)

You need your own OpenAI API key to run the tone analysis features:

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys and create a new key
4. Add it to your `.env` file:
```env
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

## Running the Application

### Frontend

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173` or `http://localhost:3000`)

## Technical Requirements Demonstrated

This implementation prototype demonstrates the following technical requirements for A5:

1. **"Hello World" App**: Basic React/Vite application running on web browser
2. **"Hello Styles"**: Implementation of design system with Tailwind CSS and shadcn/ui components
3. **Firebase Realtime Database**: Cross-device message synchronization and data persistence
4. **AI Tone Detection**: Integration with OpenAI API for analyzing message tone
5. **UI Framework**: React with TypeScript for type-safe component development

## Project Structure
```
CIS-4120-Tonify/
├── src/
│   ├── components/       # React components
│   ├── config/          # Firebase configuration
│   ├── services/        # API services (Firebase, OpenAI)
│   ├── guidelines/      # Design guidelines
│   └── styles/          # CSS and styling
├── .env                 # Environment variables (not in repo)
├── .env.example        # Environment template
├── package.json        # Dependencies
└── README.md          # This file
```

## Troubleshooting

### "Property 'env' does not exist on type 'ImportMeta'"

- Ensure `src/vite-env.d.ts` exists with proper type definitions
- Restart VS Code's TypeScript server: Cmd+Shift+P → "TypeScript: Restart TS Server"

### Firebase connection errors

- Verify all environment variables in `.env` are correct
- Ensure Firebase Realtime Database is enabled in your Firebase project
- Check that database rules allow read/write access

### OpenAI API errors

- Verify your API key is correctly set in `.env`
- Ensure you have credits available in your OpenAI account
- Check that the API key has the correct permissions

### Development server won't start

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Ensure port 5173 (or 3000) is not already in use

## Security Notes

- **Never commit `.env` files** - they contain sensitive API keys
- The `.env` file is included in `.gitignore` for security
- Each team member should use their own Firebase project and API keys for development
- Rotate API keys immediately if they are accidentally exposed

## AI Attribution

The Hi-Fi design was converted with the help of the Figma AI tool. This converted the design into code and helped with the UI functionality.
Other AI-attributions are included in the relevant files.


## Links
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Support

For questions or issues, contact team members:
- Patricia Columbia-Walsh: pcwalsh@sas.upenn.edu
- Mehak Dhaliwal
- Riya Agrawal