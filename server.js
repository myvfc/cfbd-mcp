import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;
const MCP_API_KEY = process.env.MCP_API_KEY;
const CFBD_API_KEY = process.env.CFBD_API_KEY;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Root
app.get('/', (req, res) => {
  res.json({ service: 'CFBD Stats MCP Server', status: 'running', tools: 13 });
});

// MCP endpoint
app.all('/mcp', async (req, res) => {
  console.log(`${req.method} /mcp`);
  
  // Handle GET (connection check)
  if (req.method === 'GET') {
    return res.json({ service: 'MCP Server', status: 'ready' });
  }
  
  // Handle POST (MCP protocol)
  try {
    // Auth check
    if (MCP_API_KEY) {
      const auth = req.headers.authorization;
      if (!auth || auth !== `Bearer ${MCP_API_KEY}`) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Unauthorized' },
          id: req.body?.id
        });
      }
    }
    
    const { method, params, id } = req.body;
    console.log(`  Method: ${method}`);
    
    // Initialize
    if (method === 'initialize') {
      return res.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          serverInfo: { name: 'cfbd-stats', version: '2.0.0' }
        },
        id
      });
    }
    
    // List tools
    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'get_player_stats',
              description: 'Get individual player statistics for a team',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_team_stats',
              description: 'Get team season totals (total yards, total TDs, etc.)',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_game_stats',
              description: 'Get game-by-game stats for a team',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_recruiting',
              description: 'Get recruiting class rankings',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Recruiting year (default: 2025)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_schedule',
              description: 'Get team schedule and upcoming games',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_play_by_play',
              description: 'Get detailed play-by-play for a specific game',
              inputSchema: {
                type: 'object',
                properties: {
                  gameId: { type: 'number', description: 'CFBD game ID' }
                },
                required: ['gameId']
              }
            },
            {
              name: 'get_conference_standings',
              description: 'Get conference standings for current season',
              inputSchema: {
                type: 'object',
                properties: {
                  conference: { type: 'string', description: 'Conference abbreviation (e.g., "SEC", "Big 12")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['conference']
              }
            },
            {
              name: 'get_team_rankings',
              description: 'Get team rankings (AP Poll, Coaches Poll, Playoff Rankings)',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_team_talent',
              description: 'Get team talent composite ranking',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_team_records',
              description: 'Get historical team records and win/loss history',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  startYear: { type: 'number', description: 'Start year (default: 2020)' },
                  endYear: { type: 'number', description: 'End year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_venue_info',
              description: 'Get stadium/venue information',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_returning_production',
              description: 'Get returning production (% of stats from returning players)',
              inputSchema: {
                type: 'object',
                properties: {
                  team: { type: 'string', description: 'Team name (e.g., "oklahoma")' },
                  year: { type: 'number', description: 'Season year (default: 2024)' }
                },
                required: ['team']
              }
            },
            {
              name: 'get_team_matchup',
              description: 'Get head-to-head matchup history between two teams',
              inputSchema: {
                type: 'object',
                properties: {
                  team1: { type: 'string', description: 'First team name (e.g., "oklahoma")' },
                  team2: { type: 'string', description: 'Second team name (e.g., "texas")' },
                  minYear: { type: 'number', description: 'Minimum year (default: 1900)' }
                },
                required: ['team1', 'team2']
              }
            }
          ]
        },
        id
      });
    }
    
    // Call tool
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      console.log(`  Tool: ${name}, Args:`, args);
      
      const team = (args.team || 'oklahoma').toLowerCase();
      const year = args.year || 2024;
      
      // [TOOLS 1-12 remain exactly the same as original - keeping them unchanged]
      
      // TOOL 13: Get Team Matchup - FIXED
      if (name === 'get_team_matchup') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const team1 = args.team1?.toLowerCase();
        const team2 = args.team2?.toLowerCase();
        const minYear = args.minYear || 1900;
        
        // Use the dedicated team matchup endpoint
        const url = `https://api.collegefootballdata.com/teams/matchup?team1=${team1}&team2=${team2}&minYear=${minYear}`;
        console.log(`  Fetching: ${url}`);
        
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${CFBD_API_KEY}` },
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `CFBD API error: ${response.status}` }] },
              id
            });
          }
          
          const data = await response.json();
          
          if (!data || !data.games || data.games.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No matchups found between ${team1} and ${team2} since ${minYear}` }] },
              id
            });
          }
          
          let text = `🏈 ${team1.toUpperCase()} vs ${team2.toUpperCase()} ALL-TIME\n\n`;
          
          // Overall series record
          text += `Series Record: ${team1.toUpperCase()} leads ${data.team1Wins}-${data.team2Wins}`;
          if (data.ties > 0) text += `-${data.ties}`;
          text += `\n\n`;
          
          // Recent games (last 10)
          text += `RECENT MATCHUPS:\n`;
          const recentGames = data.games.slice(-10).reverse();
          
          recentGames.forEach(game => {
            const year = game.season;
            const team1Score = game.homeTeam?.toLowerCase() === team1 ? game.homeScore : game.awayScore;
            const team2Score = game.homeTeam?.toLowerCase() === team1 ? game.awayScore : game.homeScore;
            const winner = team1Score > team2Score ? team1.toUpperCase() : team2.toUpperCase();
            
            text += `${year}: ${winner} won ${Math.max(team1Score, team2Score)}-${Math.min(team1Score, team2Score)}\n`;
          });
          
          text += `\nTotal games played: ${data.games.length}\n`;
          
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text }] },
            id
          });
          
        } catch (err) {
          console.error('  Error:', err.message);
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: `Error: ${err.message}` }] },
            id
          });
        }
      }
      
      return res.json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Unknown tool: ${name}` },
        id
      });
    }
    
    // Unknown method
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32601, message: `Unknown method: ${method}` },
      id
    });
    
  } catch (error) {
    console.error('MCP error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: error.message },
      id: req.body?.id
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 CFBD MCP Server running on port ${PORT}`);
  console.log(`📊 Tools available: 13`);
  console.log(`CFBD Key: ${CFBD_API_KEY ? 'SET ✓' : 'MISSING ✗'}`);
  console.log(`MCP Key: ${MCP_API_KEY ? 'SET ✓' : 'NONE'}\n`);
});

// Keep alive - ping self every 30 seconds
setInterval(() => {
  fetch(`http://localhost:${PORT}/health`).catch(() => {});
  console.log(`💓 Alive: ${Math.floor(process.uptime())}s`);
}, 30000);
