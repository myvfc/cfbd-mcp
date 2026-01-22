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
      
      // TOOL 1: Get Player Stats
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
              result: { content: [{ type: 'text', text: `No player stats found for ${team} in ${year}` }] },
              id
            });
          }
          
          // Group by category
          const passing = data.filter(p => p.category === 'passing').slice(0, 5);
          const rushing = data.filter(p => p.category === 'rushing').slice(0, 5);
          const receiving = data.filter(p => p.category === 'receiving').slice(0, 5);
          
          let text = `🏈 ${team.toUpperCase()} PLAYER STATS - ${year}\n\n`;
          
          if (passing.length > 0) {
            text += `PASSING:\n`;
            passing.forEach(p => {
              text += `${p.player}: ${p.stat} yards\n`;
            });
            text += `\n`;
          }
          
          if (rushing.length > 0) {
            text += `RUSHING:\n`;
            rushing.forEach(p => {
              text += `${p.player}: ${p.stat} yards\n`;
            });
            text += `\n`;
          }
          
          if (receiving.length > 0) {
            text += `RECEIVING:\n`;
            receiving.forEach(p => {
              text += `${p.player}: ${p.stat} yards\n`;
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
          
          const stats = data[0] || {};
          let text = `🏈 ${team.toUpperCase()} TEAM STATS - ${year}\n\n`;
          
          if (stats.games) text += `Games: ${stats.games}\n`;
          if (stats.totalYards) text += `Total Yards: ${stats.totalYards}\n`;
          if (stats.netPassingYards) text += `Passing Yards: ${stats.netPassingYards}\n`;
          if (stats.rushingYards) text += `Rushing Yards: ${stats.rushingYards}\n`;
          if (stats.totalTDs) text += `Total TDs: ${stats.totalTDs}\n`;
          if (stats.turnovers) text += `Turnovers: ${stats.turnovers}\n`;
          
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
            const isHome = game.home_team?.toLowerCase() === team;
            const opponent = isHome ? game.away_team : game.home_team;
            const teamScore = isHome ? game.home_points : game.away_points;
            const oppScore = isHome ? game.away_points : game.home_points;
            const result = teamScore > oppScore ? 'W' : teamScore < oppScore ? 'L' : 'T';
            
            text += `Week ${game.week}: ${result} vs ${opponent} ${teamScore}-${oppScore}\n`;
          });
          
          const wins = data.filter(g => {
            const isHome = g.home_team?.toLowerCase() === team;
            const teamScore = isHome ? g.home_points : g.away_points;
            const oppScore = isHome ? g.away_points : g.home_points;
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
      }
      
      // TOOL 4: Get Recruiting
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No recruiting data found for ${team} in ${recruitYear}` }] },
              id
            });
          }
          
          const recruiting = data[0] || {};
          let text = `🏈 ${team.toUpperCase()} RECRUITING - ${recruitYear}\n\n`;
          
          if (recruiting.rank) text += `National Rank: #${recruiting.rank}\n`;
          if (recruiting.points) text += `Points: ${recruiting.points}\n`;
          
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
            const isHome = game.home_team?.toLowerCase() === team;
            const opponent = isHome ? game.away_team : game.home_team;
            const location = isHome ? 'vs' : '@';
            
            text += `Week ${game.week}: ${location} ${opponent}\n`;
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
      
      // TOOL 8: Get Team Rankings
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No rankings found for ${team} in ${year}` }] },
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
          
          finalWeek.polls.forEach(poll => {
            const teamRanking = poll.ranks.find(r => r.school?.toLowerCase() === team);
            if (teamRanking) {
              text += `${poll.poll}: #${teamRanking.rank}\n`;
              if (teamRanking.firstPlaceVotes) {
                text += `  First-place votes: ${teamRanking.firstPlaceVotes}\n`;
              }
              if (teamRanking.points) {
                text += `  Points: ${teamRanking.points}\n`;
              }
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No talent data found for ${year}` }] },
              id
            });
          }
          
          const teamTalent = data.find(t => t.school?.toLowerCase() === team);
          
          if (!teamTalent) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No talent data found for ${team} in ${year}` }] },
              id
            });
          }
          
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
      
      // TOOL 12: Get Returning Production
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
          
          if (!data || data.length === 0) {
            return res.json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: `No returning production data found for ${team} in ${year}` }] },
              id
            });
          }
          
          const production = data[0] || {};
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
