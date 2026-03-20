require('dotenv').config({ path: '.env.local' });

async function syncCommands() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not found");
    process.exit(1);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'goals', description: 'Show all team goals' },
        { command: 'leaderboard', description: 'Who\'s crushing it?' },
        { command: 'help', description: 'Show the command guide' }
      ]
    }),
  });

  const result = await response.json();
  console.log("Sync Result:", result);
}

syncCommands();
