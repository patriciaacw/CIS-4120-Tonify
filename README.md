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
- An OpenAI API key

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/patriciaacw/CIS-4120-Tonify.git
cd CIS-4120-Tonify
```

### 2. Set Up OpenAI API Key (For Tone Analysis)

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

3. Open your browser and navigate to the URL shown in the terminal

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
- Mehak Dhaliwal: mehakkd@sas.upenn.edu
- Riya Agrawal: riya21@seas.upenn.edu
