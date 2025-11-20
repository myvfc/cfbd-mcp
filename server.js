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
  res.json({ service: 'CFBD Stats MCP Server', status: 'running' });
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
                  year: { type: 'number', description: 'Season year (default: 2025)' }
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
                  year: { type: 'number', description: 'Season year (default: 2025)' }
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
                  year: { type: 'number', description: 'Season year (default: 2025)' }
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
                  year: { type: 'number', description: 'Season year (default: 2025)' }
                },
                required: ['team']
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
      const year = args.year || 2025;
      
      // TOOL 1: Get Player Stats
      if (name === 'get_player_stats') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/stats/player/season?year=${year}&team=${team}`;
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
          console.log(`  Got ${data.length} players`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No stats found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} PLAYER STATS (${year})\n\n`;
          
          const byCategory = {};
          data.forEach(p => {
            const cat = p.category || 'other';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(p);
          });
          
          for (const [cat, players] of Object.entries(byCategory)) {
            text += `${cat.toUpperCase()}:\n`;
            players.forEach(p => {
              text += `  ${p.player}: ${p.statType} = ${p.stat}\n`;
            });
            text += '\n';
          }
          
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
      
      // TOOL 2: Get Team Stats
      if (name === 'get_team_stats') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/stats/season?year=${year}&team=${team}`;
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
          console.log(`  Got team stats`);
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No team stats found for ${team} in ${year}` }] },
              id
            });
          }
          
          const teamData = data[0];
          let text = `🏈 ${team.toUpperCase()} TEAM STATS (${year})\n\n`;
          
          if (teamData.stat) {
            text += `SEASON TOTALS:\n`;
            text += `  Games: ${teamData.stat.games || 'N/A'}\n`;
            text += `  Total Yards: ${teamData.stat.totalYards || 'N/A'}\n`;
            text += `  Pass Yards: ${teamData.stat.netPassingYards || 'N/A'}\n`;
            text += `  Rush Yards: ${teamData.stat.rushingYards || 'N/A'}\n`;
            text += `  Points Per Game: ${teamData.stat.ppg || 'N/A'}\n`;
            text += `  Turnovers: ${teamData.stat.turnovers || 'N/A'}\n`;
          }
          
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
      
      // TOOL 3: Get Game Stats
      if (name === 'get_game_stats') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/games?year=${year}&team=${team}`;
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
          console.log(`  Got ${data.length} games`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No games found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} GAME RESULTS (${year})\n\n`;
          
          data.forEach(game => {
            const isHome = game.home_team?.toLowerCase() === team;
            const opponent = isHome ? game.away_team : game.home_team;
            const ourScore = isHome ? game.home_points : game.away_points;
            const theirScore = isHome ? game.away_points : game.home_points;
            const result = ourScore > theirScore ? 'W' : (ourScore < theirScore ? 'L' : 'T');
            const location = isHome ? 'vs' : '@';
            
            text += `${result} ${location} ${opponent}: ${ourScore}-${theirScore}\n`;
          });
          
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
      
      // TOOL 4: Get Recruiting
      if (name === 'get_recruiting') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/recruiting/teams?year=${year}&team=${team}`;
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
          console.log(`  Got recruiting data`);
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No recruiting data found for ${team} in ${year}` }] },
              id
            });
          }
          
          const recruiting = data[0];
          let text = `🏈 ${team.toUpperCase()} RECRUITING (${year})\n\n`;
          text += `National Rank: #${recruiting.rank || 'N/A'}\n`;
          text += `Total Commits: ${recruiting.commits || 'N/A'}\n`;
          text += `Average Rating: ${recruiting.averageRating?.toFixed(2) || 'N/A'}\n`;
          text += `Total Points: ${recruiting.points?.toFixed(2) || 'N/A'}\n`;
          
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
      
      // TOOL 5: Get Schedule
      if (name === 'get_schedule') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/games?year=${year}&team=${team}`;
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
          console.log(`  Got ${data.length} games`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No schedule found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} SCHEDULE (${year})\n\n`;
          
          data.forEach(game => {
            const isHome = game.home_team?.toLowerCase() === team;
            const opponent = isHome ? game.away_team : game.home_team;
            const location = isHome ? 'vs' : '@';
            const date = new Date(game.start_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            
            if (game.home_points !== null && game.away_points !== null) {
              // Game completed
              const ourScore = isHome ? game.home_points : game.away_points;
              const theirScore = isHome ? game.away_points : game.home_points;
              const result = ourScore > theirScore ? 'W' : (ourScore < theirScore ? 'L' : 'T');
              text += `${date}: ${result} ${location} ${opponent} (${ourScore}-${theirScore})\n`;
            } else {
              // Upcoming game
              text += `${date}: ${location} ${opponent}\n`;
            }
          });
          
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
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`CFBD Key: ${CFBD_API_KEY ? 'SET' : 'MISSING'}`);
  console.log(`MCP Key: ${MCP_API_KEY ? 'SET' : 'NONE'}\n`);
});

// Keep alive - ping self every 30 seconds
setInterval(() => {
  fetch(`http://localhost:${PORT}/health`).catch(() => {});
  console.log(`💓 Alive: ${Math.floor(process.uptime())}s`);
}, 30000);
