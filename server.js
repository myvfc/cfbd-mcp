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
      console.log(`  Tool call: ${name}`, args);
      
      if (!CFBD_API_KEY) {
        return res.json({
          jsonrpc: '2.0',
          result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
          id
        });
      }
      
      const team = (args.team || 'oklahoma').toLowerCase();
      const year = args.year || 2024;
      
      // TOOL 1: Get Player Stats ✅ UPDATED WITH PLAYER NAME FILTERING
      if (name === 'get_player_stats') {
        const url = `https://api.collegefootballdata.com/stats/player/season?team=${team}&year=${year}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No player stats found for ${team.toUpperCase()} in ${year}` }] },
              id
            });
          }
          
          // Extract player name from query if provided
          let playerName = null;
          if (args.query) {
            // Look for capitalized names: "John Mateer", "Dillon Gabriel", etc.
            const nameMatch = args.query.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z']+)+)\b/);
            if (nameMatch) {
              playerName = nameMatch[1].trim();
              console.log(`  Extracted player name: ${playerName}`);
            }
          }
          
          // If player name specified, filter to just that player
          let filteredData = data;
          if (playerName) {
            filteredData = data.filter(p => 
              p.player?.toLowerCase().includes(playerName.toLowerCase()) ||
              playerName.toLowerCase().includes(p.player?.toLowerCase())
            );
            
            if (filteredData.length === 0) {
              return res.json({
                jsonrpc: '2.0',
                result: { 
                  content: [{ 
                    type: 'text', 
                    text: `${playerName} is not listed in ${team.toUpperCase()}'s ${year} roster.\n\nThis player may:\n• Play for a different team\n• Not have recorded stats this season\n• Have a different spelling of their name\n\nTry searching without the player name to see all ${team.toUpperCase()} players.` 
                  }] 
                },
                id
              });
            }
          }
          
          // Group by player and category
          const playerStats = {};
          
          filteredData.forEach(stat => {
            const player = stat.player;
            if (!playerStats[player]) {
              playerStats[player] = { passing: [], rushing: [], receiving: [] };
            }
            
            const category = stat.category?.toLowerCase();
            if (category === 'passing' || category === 'rushing' || category === 'receiving') {
              playerStats[player][category].push({
                statType: stat.statType,
                stat: stat.stat
              });
            }
          });
          
          let text = `🏈 ${team.toUpperCase()} PLAYER STATS - ${year}\n\n`;
          
          // If searching for specific player, show detailed stats
          if (playerName && Object.keys(playerStats).length === 1) {
            const player = Object.keys(playerStats)[0];
            text = `🏈 ${player.toUpperCase()} - ${year}\n\n`;
            
            const stats = playerStats[player];
            
            if (stats.passing.length > 0) {
              text += `PASSING:\n`;
              stats.passing.forEach(s => {
                text += `${s.statType}: ${s.stat}\n`;
              });
              text += `\n`;
            }
            
            if (stats.rushing.length > 0) {
              text += `RUSHING:\n`;
              stats.rushing.forEach(s => {
                text += `${s.statType}: ${s.stat}\n`;
              });
              text += `\n`;
            }
            
            if (stats.receiving.length > 0) {
              text += `RECEIVING:\n`;
              stats.receiving.forEach(s => {
                text += `${s.statType}: ${s.stat}\n`;
              });
            }
          } else {
            // Show top players by category
            const passingLeaders = data.filter(p => p.category === 'passing' && p.statType === 'YDS').slice(0, 5);
            const rushingLeaders = data.filter(p => p.category === 'rushing' && p.statType === 'YDS').slice(0, 5);
            const receivingLeaders = data.filter(p => p.category === 'receiving' && p.statType === 'YDS').slice(0, 5);
            
            if (passingLeaders.length > 0) {
              text += `PASSING LEADERS:\n`;
              passingLeaders.forEach(p => {
                text += `${p.player}: ${p.stat} yards\n`;
              });
              text += `\n`;
            }
            
            if (rushingLeaders.length > 0) {
              text += `RUSHING LEADERS:\n`;
              rushingLeaders.forEach(p => {
                text += `${p.player}: ${p.stat} yards\n`;
              });
              text += `\n`;
            }
            
            if (receivingLeaders.length > 0) {
              text += `RECEIVING LEADERS:\n`;
              receivingLeaders.forEach(p => {
                text += `${p.player}: ${p.stat} yards\n`;
              });
            }
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
        const url = `https://api.collegefootballdata.com/stats/season?team=${team}&year=${year}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No team stats found for ${team} in ${year}` }] },
              id
            });
          }
          
          // Convert array of {statName, statValue} to object
          const statsObj = {};
          data.forEach(stat => {
            if (stat.statName && stat.statValue !== undefined) {
              statsObj[stat.statName] = stat.statValue;
            }
          });
          
          let text = `🏈 ${team.toUpperCase()} TEAM STATS - ${year}\n\n`;
          
          if (statsObj.games) text += `Games: ${statsObj.games}\n`;
          if (statsObj.totalYards) text += `Total Yards: ${statsObj.totalYards}\n`;
          if (statsObj.netPassingYards) text += `Passing Yards: ${statsObj.netPassingYards}\n`;
          if (statsObj.rushingYards) text += `Rushing Yards: ${statsObj.rushingYards}\n`;
          if (statsObj.passCompletions && statsObj.passAttempts) {
            text += `Pass Completion: ${statsObj.passCompletions}/${statsObj.passAttempts}\n`;
          }
          if (statsObj.firstDowns) text += `First Downs: ${statsObj.firstDowns}\n`;
          if (statsObj.turnovers) text += `Turnovers: ${statsObj.turnovers}\n`;
          if (statsObj.fumblesLost) text += `Fumbles Lost: ${statsObj.fumblesLost}\n`;
          if (statsObj.interceptions) text += `Interceptions Thrown: ${statsObj.interceptions}\n`;
          
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
      
      // TOOL 3: Get Game Stats - Now supports specific game queries
      if (name === 'get_game_stats') {
        // Check if asking about specific opponent
        const opponent = args.opponent || null;
        
        if (opponent) {
          // Get specific game stats
          const gamesUrl = `https://api.collegefootballdata.com/games?team=${team}&year=${year}`;
          console.log(`  Fetching games: ${gamesUrl}`);
          
          try {
            const gamesResponse = await fetch(gamesUrl, {
              headers: { Authorization: `Bearer ${CFBD_API_KEY}` },
              signal: AbortSignal.timeout(10000)
            });
            
            if (!gamesResponse.ok) {
              return res.json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `CFBD API error: ${gamesResponse.status}` }] },
                id
              });
            }
            
            const games = await gamesResponse.json();
            
            // Find the specific game
            const game = games.find(g => 
              g.homeTeam?.toLowerCase().includes(opponent.toLowerCase()) || 
              g.awayTeam?.toLowerCase().includes(opponent.toLowerCase())
            );
            
            if (!game) {
              return res.json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `No game found between ${team.toUpperCase()} and ${opponent} in ${year}` }] },
                id
              });
            }
            
            // Now fetch detailed team stats for this game
            const statsUrl = `https://api.collegefootballdata.com/games/teams?gameId=${game.id}`;
            console.log(`  Fetching game stats: ${statsUrl}`);
            
            const statsResponse = await fetch(statsUrl, {
              headers: { Authorization: `Bearer ${CFBD_API_KEY}` },
              signal: AbortSignal.timeout(10000)
            });
            
            if (!statsResponse.ok) {
              return res.json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `Could not fetch detailed stats for this game` }] },
                id
              });
            }
            
            const teamStats = await statsResponse.json();
            
            if (!teamStats || teamStats.length === 0) {
              return res.json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `No detailed stats available for this game` }] },
                id
              });
            }
            
            // Find OU's stats
            const ouStats = teamStats.find(t => t.school?.toLowerCase() === team.toLowerCase());
            const oppStats = teamStats.find(t => t.school?.toLowerCase() !== team.toLowerCase());
            
            if (!ouStats) {
              return res.json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `Stats not found for ${team.toUpperCase()} in this game` }] },
                id
              });
            }
            
            const isHome = game.homeTeam?.toLowerCase() === team.toLowerCase();
            const teamScore = isHome ? game.homePoints : game.awayPoints;
            const oppScore = isHome ? game.awayPoints : game.homePoints;
            const result = teamScore > oppScore ? 'W' : 'L';
            
            let text = `🏈 ${team.toUpperCase()} vs ${opponent.toUpperCase()} - ${year}\n`;
            text += `Result: ${result} ${teamScore}-${oppScore}\n\n`;
            
            text += `${team.toUpperCase()} STATS:\n`;
            if (ouStats.stats) {
              ouStats.stats.forEach(stat => {
                if (stat.category === 'totalYards') text += `Total Yards: ${stat.stat}\n`;
                else if (stat.category === 'netPassingYards') text += `Passing Yards: ${stat.stat}\n`;
                else if (stat.category === 'rushingYards') text += `Rushing Yards: ${stat.stat}\n`;
                else if (stat.category === 'turnovers') text += `Turnovers: ${stat.stat}\n`;
                else if (stat.category === 'firstDowns') text += `First Downs: ${stat.stat}\n`;
                else if (stat.category === 'thirdDownEff') text += `Third Down: ${stat.stat}\n`;
                else if (stat.category === 'fumblesLost') text += `Fumbles Lost: ${stat.stat}\n`;
                else if (stat.category === 'interceptions') text += `Interceptions: ${stat.stat}\n`;
              });
            }
            
            if (oppStats && oppStats.stats) {
              text += `\n${opponent.toUpperCase()} STATS:\n`;
              oppStats.stats.forEach(stat => {
                if (stat.category === 'totalYards') text += `Total Yards: ${stat.stat}\n`;
                else if (stat.category === 'netPassingYards') text += `Passing Yards: ${stat.stat}\n`;
                else if (stat.category === 'rushingYards') text += `Rushing Yards: ${stat.stat}\n`;
                else if (stat.category === 'turnovers') text += `Turnovers: ${stat.stat}\n`;
                else if (stat.category === 'firstDowns') text += `First Downs: ${stat.stat}\n`;
              });
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
        } else {
          // Show all games (game-by-game scores)
          const url = `https://api.collegefootballdata.com/games?team=${team}&year=${year}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No games found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} GAME-BY-GAME - ${year}\n\n`;
          
          data.forEach(game => {
            const isHome = game.homeTeam?.toLowerCase() === team.toLowerCase();
            const opponent = isHome ? game.awayTeam : game.homeTeam;
            const teamScore = isHome ? game.homePoints : game.awayPoints;
            const oppScore = isHome ? game.awayPoints : game.homePoints;
            const result = teamScore > oppScore ? 'W' : teamScore < oppScore ? 'L' : 'T';
            
            text += `Week ${game.week}: ${result} vs ${opponent} ${teamScore}-${oppScore}\n`;
          });
          
          const wins = data.filter(g => {
            const isHome = g.homeTeam?.toLowerCase() === team.toLowerCase();
            const teamScore = isHome ? g.homePoints : g.awayPoints;
            const oppScore = isHome ? g.awayPoints : g.homePoints;
            return teamScore > oppScore;
          }).length;
          
          text += `\nRecord: ${wins}-${data.length - wins}`;
          
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
        }  // Close the else block
      }  // Close the if (name === 'get_game_stats') block
      
      // TOOL 4: Get Recruiting ✅ UPDATED WITH NO-DATA HANDLING
      if (name === 'get_recruiting') {
        const recruitYear = args.year || 2025;
        const url = `https://api.collegefootballdata.com/recruiting/teams?team=${team}&year=${recruitYear}`;
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
          
          // STEP 1: No data at all
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `Recruiting rankings for ${recruitYear} are not yet available.\n\nRecruiting data is typically published 1-2 years in advance. Current data includes:\n• 2025 class (signed)\n• 2026 class (commitments)\n• 2027 class (early commitments)\n\nTry asking about a more recent class!` 
                }] 
              },
              id
            });
          }
          
          const recruiting = data[0];
          
          // STEP 2: Data exists but empty for this team
          if (!recruiting || (!recruiting.rank && !recruiting.points)) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `Recruiting data exists for ${recruitYear}, but ${team.toUpperCase()} doesn't appear in the rankings. This could mean:\n• The team didn't have a ranked recruiting class that year\n• Team name variation issue\n• Data wasn't tracked for all teams that year` 
                }] 
              },
              id
            });
          }
          
          // STEP 3: Format normal response
          let text = `🏈 ${team.toUpperCase()} RECRUITING - ${recruitYear}\n\n`;
          
          if (recruiting.rank) text += `National Rank: #${recruiting.rank}\n`;
          if (recruiting.points) text += `Points: ${recruiting.points.toFixed(2)}\n`;
          
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
        const url = `https://api.collegefootballdata.com/games?team=${team}&year=${year}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No schedule found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} SCHEDULE - ${year}\n\n`;
          
          data.forEach(game => {
            const isHome = game.homeTeam?.toLowerCase() === team.toLowerCase();
            const opponent = isHome ? game.awayTeam : game.homeTeam;
            const location = isHome ? 'vs' : '@';
            
            text += `Week ${game.week}: ${location} ${opponent}`;
            
            // Add score if game is completed
            if (game.completed) {
              const teamScore = isHome ? game.homePoints : game.awayPoints;
              const oppScore = isHome ? game.awayPoints : game.homePoints;
              const result = teamScore > oppScore ? 'W' : (teamScore < oppScore ? 'L' : 'T');
              text += ` - ${result} ${teamScore}-${oppScore}`;
            }
            
            text += `\n`;
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
      
      // TOOL 6: Get Play by Play
      if (name === 'get_play_by_play') {
        const gameId = args.gameId;
        if (!gameId) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: gameId required' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/plays?gameId=${gameId}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No play-by-play found for game ${gameId}` }] },
              id
            });
          }
          
          let text = `🏈 PLAY-BY-PLAY - Game ${gameId}\n\n`;
          
          // Show scoring plays only
          const scoringPlays = data.filter(p => p.scoringPlay);
          scoringPlays.slice(0, 20).forEach(play => {
            text += `Q${play.period} ${play.clock}: ${play.playText}\n`;
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
      
      // TOOL 7: Get Conference Standings
      if (name === 'get_conference_standings') {
        const conference = args.conference || 'SEC';
        const standingsYear = args.year || 2024;
        const url = `https://api.collegefootballdata.com/standings?conference=${conference}&year=${standingsYear}`;
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
          
          console.log(`  DEBUG - Standings response:`, JSON.stringify(data, null, 2).substring(0, 600));
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No standings found for ${conference} in ${standingsYear}` }] },
              id
            });
          }
          
          let text = `🏈 ${conference.toUpperCase()} STANDINGS - ${standingsYear}\n\n`;
          
          data.forEach((team, index) => {
            text += `${index + 1}. ${team.team} (${team.wins}-${team.losses})\n`;
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
      
      // TOOL 8: Get Team Rankings ✅ UPDATED WITH NO-DATA HANDLING
      if (name === 'get_team_rankings') {
        const url = `https://api.collegefootballdata.com/rankings?year=${year}&team=${team}`;
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
          
          // STEP 1: No data at all
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `${team.toUpperCase()} was not ranked at any point during the ${year} season.` }] },
              id
            });
          }
          
          // Get final rankings (last week of season)
          const finalWeek = data[data.length - 1];
          
          if (!finalWeek || !finalWeek.polls || finalWeek.polls.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No final rankings found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} RANKINGS - ${year}\n\n`;
          text += `Week ${finalWeek.week} (${finalWeek.seasonType}):\n\n`;
          
          let foundRankings = false;
          
          finalWeek.polls.forEach(poll => {
            const teamRanking = poll.ranks.find(r => r.school?.toLowerCase() === team);
            if (teamRanking) {
              foundRankings = true;
              text += `${poll.poll}: #${teamRanking.rank}\n`;
              if (teamRanking.firstPlaceVotes) {
                text += `  First-place votes: ${teamRanking.firstPlaceVotes}\n`;
              }
              if (teamRanking.points) {
                text += `  Points: ${teamRanking.points}\n`;
              }
            }
          });
          
          // STEP 2: Team wasn't in any final polls
          if (!foundRankings) {
            text = `🏈 ${team.toUpperCase()} - ${year} SEASON\n\n`;
            text += `${team.toUpperCase()} was not ranked in the final ${year} polls.\n\n`;
            text += `This typically means the team finished with a losing record or just outside the Top 25.`;
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
      
      // TOOL 9: Get Team Talent ✅ UPDATED WITH NO-DATA HANDLING
      if (name === 'get_team_talent') {
        const url = `https://api.collegefootballdata.com/talent?year=${year}`;
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
          
          console.log(`  DEBUG - Talent data length:`, data?.length);
          if (data && data.length > 0) {
            console.log(`  DEBUG - First talent entry:`, JSON.stringify(data[0], null, 2).substring(0, 300));
            const ouEntry = data.find(t => t.school?.toLowerCase() === team.toLowerCase() || t.team?.toLowerCase() === team.toLowerCase());
            console.log(`  DEBUG - OU talent entry:`, JSON.stringify(ouEntry, null, 2));
          }
          
          // STEP 1: No data at all
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `Talent composite data is not available for ${year}.\n\nThis metric was introduced in 2015. Data is available for years 2015-present.\n\nTry asking about a year from 2015 onwards!` 
                }] 
              },
              id
            });
          }
          
          const teamTalent = data.find(t => t.school?.toLowerCase() === team.toLowerCase() || t.team?.toLowerCase() === team.toLowerCase());
          
          // STEP 2: Data exists but empty for this team
          if (!teamTalent || !teamTalent.talent) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `Talent rankings exist for ${year}, but ${team.toUpperCase()} is not included. This could mean:\n• The team was not in FBS that year\n• Team name mismatch\n• Data collection issues for that specific team` 
                }] 
              },
              id
            });
          }
          
          // STEP 3: Format normal response
          let text = `🏈 ${team.toUpperCase()} TALENT COMPOSITE - ${year}\n\n`;
          text += `Talent Rank: ${teamTalent.talent}\n`;
          
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
      
      // TOOL 10: Get Team Records
      if (name === 'get_team_records') {
        const startYear = args.startYear || 2020;
        const endYear = args.endYear || 2024;
        const url = `https://api.collegefootballdata.com/records?team=${team}&startYear=${startYear}&endYear=${endYear}`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No records found for ${team} from ${startYear}-${endYear}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} RECORDS ${startYear}-${endYear}\n\n`;
          
          data.forEach(record => {
            text += `${record.year}: ${record.total.wins}-${record.total.losses}`;
            if (record.total.ties > 0) text += `-${record.total.ties}`;
            text += `\n`;
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
      
      // TOOL 11: Get Venue Info
      if (name === 'get_venue_info') {
        const url = `https://api.collegefootballdata.com/venues`;
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No venue data found` }] },
              id
            });
          }
          
          // Find venue for team
          const venue = data.find(v => 
            v.name?.toLowerCase().includes(team) || 
            (team === 'oklahoma' && v.name?.toLowerCase().includes('memorial'))
          );
          
          if (!venue) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No venue found for ${team}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} VENUE INFO\n\n`;
          text += `Stadium: ${venue.name}\n`;
          if (venue.capacity) text += `Capacity: ${venue.capacity.toLocaleString()}\n`;
          if (venue.city) text += `Location: ${venue.city}, ${venue.state}\n`;
          if (venue.grass !== undefined) text += `Surface: ${venue.grass ? 'Grass' : 'Turf'}\n`;
          
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
      
      // TOOL 12: Get Returning Production ✅ UPDATED WITH NO-DATA HANDLING
      if (name === 'get_returning_production') {
        const url = `https://api.collegefootballdata.com/player/returning?team=${team}&year=${year}`;
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
          
          console.log(`  DEBUG - Returning production response:`, JSON.stringify(data, null, 2).substring(0, 600));
          
          // STEP 1: No data at all
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `No returning production data found for ${team.toUpperCase()} in ${year}.\n\nThis metric is only available for recent years (typically 2015-present).\n\nTry asking about a more recent season!` 
                }] 
              },
              id
            });
          }
          
          const production = data[0];
          
          // STEP 2: Data exists but empty for this team
          if (!production || (production.passingUsage === undefined && production.rushingUsage === undefined && production.receivingUsage === undefined)) {
            return res.json({
              jsonrpc: '2.0',
              result: { 
                content: [{ 
                  type: 'text', 
                  text: `Returning production data exists for ${year}, but ${team.toUpperCase()} has no recorded percentages. This data can be spotty for some teams and years.\n\nTry asking about the previous or next season!` 
                }] 
              },
              id
            });
          }
          
          // STEP 3: Format normal response
          let text = `🏈 ${team.toUpperCase()} RETURNING PRODUCTION - ${year}\n\n`;
          
          if (production.passingUsage !== undefined) {
            text += `Passing: ${(production.passingUsage * 100).toFixed(1)}%\n`;
          }
          if (production.rushingUsage !== undefined) {
            text += `Rushing: ${(production.rushingUsage * 100).toFixed(1)}%\n`;
          }
          if (production.receivingUsage !== undefined) {
            text += `Receiving: ${(production.receivingUsage * 100).toFixed(1)}%\n`;
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
      
      // TOOL 13: Get Team Matchup
      if (name === 'get_team_matchup') {
        const team1 = args.team1?.toLowerCase();
        const team2 = args.team2?.toLowerCase();
        const minYear = args.minYear || 1900;
        
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
          
          text += `Series Record: ${team1.toUpperCase()} leads ${data.team1Wins}-${data.team2Wins}`;
          if (data.ties > 0) text += `-${data.ties}`;
          text += `\n\n`;
          
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
      
      // Unknown tool
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

// Keep alive
setInterval(() => {
  fetch(`http://localhost:${PORT}/health`).catch(() => {});
  console.log(`💓 Alive: ${Math.floor(process.uptime())}s`);
}, 30000);



