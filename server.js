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
                  minYear: { type: 'number', description: 'Minimum year (default: 2000)' }
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
            players.slice(0, 10).forEach(p => {
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
        
        const recruitYear = args.year || 2025;
        const url = `https://api.collegefootballdata.com/recruiting/teams?year=${recruitYear}&team=${team}`;
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
              result: { content: [{ type: 'text', text: `No recruiting data found for ${team} in ${recruitYear}` }] },
              id
            });
          }
          
          const recruiting = data[0];
          let text = `🏈 ${team.toUpperCase()} RECRUITING (${recruitYear})\n\n`;
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
      
      // TOOL 6: Get Play-by-Play
      if (name === 'get_play_by_play') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const gameId = args.gameId;
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
          console.log(`  Got ${data.length} plays`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No play-by-play data found for game ${gameId}` }] },
              id
            });
          }
          
          let text = `🏈 PLAY-BY-PLAY (Game ${gameId})\n\n`;
          
          // Show first 20 plays
          data.slice(0, 20).forEach(play => {
            const period = play.period;
            const clock = play.clock?.minutes && play.clock?.seconds 
              ? `${play.period}Q ${play.clock.minutes}:${String(play.clock.seconds).padStart(2, '0')}`
              : `${play.period}Q`;
            const down = play.down ? `${play.down} & ${play.distance}` : '';
            const offense = play.offense;
            const playText = play.playText || 'No description';
            
            text += `${clock} - ${offense} ${down}\n  ${playText}\n\n`;
          });
          
          if (data.length > 20) {
            text += `... (${data.length - 20} more plays)\n`;
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
      
      // TOOL 7: Get Conference Standings
      if (name === 'get_conference_standings') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const conference = args.conference;
        const url = `https://api.collegefootballdata.com/standings?year=${year}&conference=${conference}`;
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
          console.log(`  Got ${data.length} teams`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No standings found for ${conference} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${conference.toUpperCase()} STANDINGS (${year})\n\n`;
          
          data.forEach((team, idx) => {
            text += `${idx + 1}. ${team.team} (${team.wins}-${team.losses}`;
            if (team.conferenceWins !== undefined) {
              text += `, ${team.conferenceWins}-${team.conferenceLosses} conf`;
            }
            text += `)\n`;
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
      
      // TOOL 8: Get Team Rankings
      if (name === 'get_team_rankings') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
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
          console.log(`  Got ${data.length} weeks of rankings`);
          
          if (data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No rankings found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} RANKINGS (${year})\n\n`;
          
          // Get latest week
          const latest = data[data.length - 1];
          text += `Week ${latest.week} (${latest.seasonType}):\n`;
          
          latest.polls.forEach(poll => {
            const teamRank = poll.ranks.find(r => r.school.toLowerCase() === team);
            if (teamRank) {
              text += `  ${poll.poll}: #${teamRank.rank}\n`;
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
      
      // TOOL 9: Get Team Talent
      if (name === 'get_team_talent') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
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
          const teamData = data.find(t => t.school.toLowerCase() === team);
          
          if (!teamData) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No talent data found for ${team} in ${year}` }] },
              id
            });
          }
          
          let text = `🏈 ${team.toUpperCase()} TALENT COMPOSITE (${year})\n\n`;
          text += `National Rank: #${teamData.rank}\n`;
          text += `Talent Rating: ${teamData.talent.toFixed(2)}\n`;
          
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
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const startYear = args.startYear || 2020;
        const endYear = args.endYear || 2024;
        const url = `https://api.collegefootballdata.com/records?startYear=${startYear}&endYear=${endYear}&team=${team}`;
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
              result: { content: [{ type: 'text', text: `No records found for ${team} (${startYear}-${endYear})` }] },
              id
            });
          }
          
          const teamData = data[0];
          let text = `🏈 ${team.toUpperCase()} RECORDS (${startYear}-${endYear})\n\n`;
          text += `Total Record: ${teamData.total.wins}-${teamData.total.losses}`;
          if (teamData.total.ties > 0) text += `-${teamData.total.ties}`;
          text += `\n`;
          text += `Win Percentage: ${(teamData.total.winningPercentage * 100).toFixed(1)}%\n`;
          
          if (teamData.conferenceGames) {
            text += `\nConference: ${teamData.conferenceGames.wins}-${teamData.conferenceGames.losses}`;
            if (teamData.conferenceGames.ties > 0) text += `-${teamData.conferenceGames.ties}`;
            text += `\n`;
          }
          
          if (teamData.homeGames) {
            text += `Home: ${teamData.homeGames.wins}-${teamData.homeGames.losses}\n`;
          }
          
          if (teamData.awayGames) {
            text += `Away: ${teamData.awayGames.wins}-${teamData.awayGames.losses}\n`;
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
      
      // TOOL 11: Get Venue Info
      if (name === 'get_venue_info') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
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
          const venue = data.find(v => v.city && v.name && 
            (v.name.toLowerCase().includes(team) || team.includes(v.city.toLowerCase())));
          
          if (!venue) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No venue found for ${team}` }] },
              id
            });
          }
          
          let text = `🏈 VENUE INFO\n\n`;
          text += `Stadium: ${venue.name}\n`;
          text += `Location: ${venue.city}, ${venue.state}\n`;
          text += `Capacity: ${venue.capacity?.toLocaleString() || 'N/A'}\n`;
          text += `Elevation: ${venue.elevation || 'N/A'} ft\n`;
          if (venue.grass !== undefined) {
            text += `Surface: ${venue.grass ? 'Grass' : 'Artificial Turf'}\n`;
          }
          if (venue.dome !== undefined) {
            text += `Dome: ${venue.dome ? 'Yes' : 'No'}\n`;
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
      
      // TOOL 12: Get Returning Production
      if (name === 'get_returning_production') {
        if (!CFBD_API_KEY) {
          return res.json({
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: 'Error: CFBD API key not configured' }] },
            id
          });
        }
        
        const url = `https://api.collegefootballdata.com/player/returning?year=${year}&team=${team}`;
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
              result: { content: [{ type: 'text', text: `No returning production data found for ${team} in ${year}` }] },
              id
            });
          }
          
          const teamData = data[0];
          let text = `🏈 ${team.toUpperCase()} RETURNING PRODUCTION (${year})\n\n`;
          text += `Total Returning: ${(teamData.totalPPA * 100).toFixed(1)}%\n`;
          text += `Passing: ${(teamData.passingPPA * 100).toFixed(1)}%\n`;
          text += `Rushing: ${(teamData.rushingPPA * 100).toFixed(1)}%\n`;
          text += `Receiving: ${(teamData.receivingPPA * 100).toFixed(1)}%\n`;
          
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
      
     // TOOL 13: Get Team Matchup - FIXED VERSION
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
