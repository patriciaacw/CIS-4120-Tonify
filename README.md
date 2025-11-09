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
4. Export the key in your terminal before running the application:
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Note**: You must set this environment variable in each new terminal session before running the app.

## Running the Application

### Step 1: Start the Backend Server

In your terminal, set your OpenAI API key and start the server. Install the express package if you do not have already.:
```bash
npm install express cors body-parser openai
export OPENAI_API_KEY="sk-your-api-key-here"
node server.js
```

Keep this terminal window running.

### Step 2: Start the Frontend

Open a **new terminal window** and run:

1. Install dependencies (first time only):
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
├── server.js            # Backend server for AI tone analysis
├── .env                 # Environment variables (not in repo)
├── .env.example        # Environment template
├── package.json        # Dependencies
└── README.md          # This file
```
## Troubleshooting
### OpenAI API errors
- Verify your API key is correctly exported in the terminal: `echo $OPENAI_API_KEY`
- Ensure you have credits available in your OpenAI account
- Check that the API key has the correct permissions
- Remember to export the key in each new terminal session before running `node server.js`
### Backend server errors
- Make sure you exported the OpenAI API key before running `node server.js`
- Check that the server is running (you should see a message like "Server running on port 3001")
- Ensure the port isn't already in use by another application
### Development server won't start
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Ensure port 5173 (or 3000) is not already in use
## Security Notes
- **Never commit API keys** to the repository
- Each team member should use their own OpenAI API key for development
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
