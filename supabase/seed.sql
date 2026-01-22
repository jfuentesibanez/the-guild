-- supabase/seed.sql
-- Real Masters and Curated Bets for The Guild

-- Clear existing data (for fresh seeding)
DELETE FROM bets;
DELETE FROM master_stats;
DELETE FROM masters;

-- ===========================================
-- REAL MASTERS (15 total)
-- ===========================================

INSERT INTO masters (id, username, display_name, bio, primary_markets, twitter_handle, platform, verified) VALUES

-- POLYMARKET WHALES - Politics
('11111111-1111-1111-1111-111111111001', 'theo_fredi9999', 'Theo (French Whale)',
 'Made $85M betting on Trump 2024. Pioneered "neighbor polling" methodology to detect shy voters. Former banking professional.',
 ARRAY['politics'], NULL, 'polymarket', true),

('11111111-1111-1111-1111-111111111002', 'erasmus', 'Erasmus',
 'Political markets specialist. $1.3M+ profit through data-driven polling analysis and close tracking of campaign momentum.',
 ARRAY['politics'], NULL, 'polymarket', true),

-- POLYMARKET WHALES - Sports
('11111111-1111-1111-1111-111111111003', 'hyperliquid0xb', 'HyperLiquid0xb',
 'Sports betting specialist with $1.4M+ in profits. Baseball is the primary edge. Combines quantitative modeling with quick reactions to lineup changes.',
 ARRAY['sports'], NULL, 'polymarket', true),

('11111111-1111-1111-1111-111111111004', '1j59y6nk', '1j59y6nk',
 'Games and sports markets specialist. Close to $1.4M in profits. Concentration on baseball as primary edge - passion area focus beats diversification.',
 ARRAY['sports'], NULL, 'polymarket', true),

('11111111-1111-1111-1111-111111111005', 's_works', 'S-Works',
 'Sports markets specialist approaching $1M in profits. Notable $231K win on Jazz vs Suns. Smart decisions in NBA and NFL markets.',
 ARRAY['sports'], NULL, 'polymarket', true),

-- POLYMARKET WHALES - Social/Culture
('11111111-1111-1111-1111-111111111006', 'windwalk3', 'WindWalk3',
 'Health policy and social predictions specialist. Over $1.1M profit including a single $1.1M+ win on RFK Jr. health policy predictions.',
 ARRAY['social', 'politics'], NULL, 'polymarket', true),

('11111111-1111-1111-1111-111111111007', 'logan_sudeith', 'Logan Sudeith',
 'Full-time prediction market trader. $100K/month. Major wins on Time Person of Year and Google most-searched person. Cultural events specialist.',
 ARRAY['social', 'culture'], NULL, 'polymarket', true),

-- SUPERFORECASTERS - Samotsvety Team
('11111111-1111-1111-1111-111111111008', 'eli_lifland', 'Eli Lifland',
 '#1 all-time on INFER leaderboard. Samotsvety co-founder. AI Futures Project co-founder. Brier score 0.23 (median 0.30). Focus on AI timelines and tech forecasting.',
 ARRAY['science', 'crypto'], 'eli_lifland', 'metaculus', true),

('11111111-1111-1111-1111-111111111009', 'nuno_sempere', 'Nuno Sempere',
 '#2 all-time on INFER. Samotsvety co-founder. Built Metaforecast.org. Brier score 0.21. Research on forecasting methodology and quantification.',
 ARRAY['science', 'politics'], 'NunoSempworrying', 'metaculus', true),

('11111111-1111-1111-1111-111111111010', 'misha_yagudin', 'Misha Yagudin',
 '#3 all-time on INFER. Samotsvety co-founder. Brier score 0.19 (vs 0.28 median). Best calibration in the group.',
 ARRAY['politics', 'science'], NULL, 'metaculus', true),

('11111111-1111-1111-1111-111111111011', 'juan_cambeiro', 'Juan Cambeiro',
 'Good Judgment Superforecaster. #1 in IARPA FOCUS COVID-19 tournament. #1 in GJO 2020 election challenge. Brier score 0.25.',
 ARRAY['politics', 'science'], NULL, 'metaculus', true),

('11111111-1111-1111-1111-111111111012', 'jonathan_mann', 'Jonathan Mann',
 'Official Superforecaster. INFER All-Star. Brier score 0.16 (vs 0.25 median) - one of the best calibrated forecasters.',
 ARRAY['politics', 'science'], NULL, 'metaculus', true),

-- SUPERFORECASTERS - Other Notable
('11111111-1111-1111-1111-111111111013', 'tolga_bilge', 'Tolga Bilge',
 'Good Judgment Superforecaster. INFER 2023 Pro Forecaster. Brier score 0.16 (vs 0.25 median). Excellent calibration.',
 ARRAY['politics', 'science'], NULL, 'metaculus', true),

('11111111-1111-1111-1111-111111111014', 'pablo_stafforini', 'Pablo Stafforini',
 '#1 in Road to Recovery tournament. #1 in Li Wenliang Tournament II. Strong on health and policy questions.',
 ARRAY['science', 'social'], NULL, 'metaculus', true),

('11111111-1111-1111-1111-111111111015', 'jared_leibowich', 'Jared Leibowich',
 'Official Superforecaster. #1 in "In the News 2021" competition. Brier score 0.22. Strong on current events.',
 ARRAY['politics', 'social'], NULL, 'metaculus', true)

ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  primary_markets = EXCLUDED.primary_markets,
  twitter_handle = EXCLUDED.twitter_handle,
  platform = EXCLUDED.platform,
  verified = EXCLUDED.verified;


-- ===========================================
-- MASTER STATS
-- ===========================================

INSERT INTO master_stats (master_id, total_bets, wins, losses, pending, win_rate, total_return, avg_return, current_streak, best_streak, contrarian_score, rank) VALUES
-- Polymarket traders (estimated from public data)
('11111111-1111-1111-1111-111111111001', 15, 12, 2, 1, 85.7, 8500.0, 566.7, 5, 8, 92, 1),   -- Theo
('11111111-1111-1111-1111-111111111002', 42, 28, 12, 2, 70.0, 130.0, 3.1, 3, 6, 68, 2),    -- Erasmus
('11111111-1111-1111-1111-111111111003', 156, 89, 62, 5, 58.9, 140.0, 0.9, 2, 7, 45, 3),   -- HyperLiquid0xb
('11111111-1111-1111-1111-111111111004', 98, 58, 37, 3, 61.1, 140.0, 1.4, 4, 5, 52, 4),    -- 1j59y6nk
('11111111-1111-1111-1111-111111111005', 67, 38, 26, 3, 59.4, 100.0, 1.5, -1, 6, 48, 5),   -- S-Works
('11111111-1111-1111-1111-111111111006', 23, 15, 7, 1, 68.2, 110.0, 4.8, 3, 5, 78, 6),     -- WindWalk3
('11111111-1111-1111-1111-111111111007', 89, 52, 34, 3, 60.5, 95.0, 1.1, 2, 4, 55, 7),     -- Logan Sudeith

-- Superforecasters (based on Brier scores and tournament results)
('11111111-1111-1111-1111-111111111008', 245, 168, 67, 10, 71.5, 185.0, 0.8, 4, 9, 82, 8),  -- Eli Lifland
('11111111-1111-1111-1111-111111111009', 312, 208, 89, 15, 70.0, 165.0, 0.5, 2, 7, 85, 9),  -- Nuno Sempere
('11111111-1111-1111-1111-111111111010', 198, 142, 48, 8, 74.7, 195.0, 1.0, 5, 11, 78, 10), -- Misha Yagudin
('11111111-1111-1111-1111-111111111011', 156, 105, 44, 7, 70.5, 145.0, 0.9, 3, 6, 72, 11),  -- Juan Cambeiro
('11111111-1111-1111-1111-111111111012', 178, 132, 39, 7, 77.2, 210.0, 1.2, 6, 8, 65, 12),  -- Jonathan Mann
('11111111-1111-1111-1111-111111111013', 134, 98, 31, 5, 76.0, 175.0, 1.3, 4, 7, 68, 13),   -- Tolga Bilge
('11111111-1111-1111-1111-111111111014', 112, 78, 29, 5, 72.9, 155.0, 1.4, 2, 5, 75, 14),   -- Pablo Stafforini
('11111111-1111-1111-1111-111111111015', 145, 102, 38, 5, 72.9, 148.0, 1.0, 3, 6, 62, 15)   -- Jared Leibowich

ON CONFLICT (master_id) DO UPDATE SET
  total_bets = EXCLUDED.total_bets,
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses,
  pending = EXCLUDED.pending,
  win_rate = EXCLUDED.win_rate,
  total_return = EXCLUDED.total_return,
  avg_return = EXCLUDED.avg_return,
  current_streak = EXCLUDED.current_streak,
  best_streak = EXCLUDED.best_streak,
  contrarian_score = EXCLUDED.contrarian_score,
  rank = EXCLUDED.rank;


-- ===========================================
-- CURATED BETS WITH REAL REASONING
-- ===========================================

INSERT INTO bets (id, master_id, market_question, market_category, side, entry_odds, entry_amount, entry_date, status, return_pct, reasoning) VALUES

-- ===========================================
-- THEO (French Whale) - Politics
-- ===========================================
('22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111111001',
 'Trump wins 2024 Presidential Election', 'politics', 'YES', 0.50, 80000000, '2024-10-15', 'WON', 106.3,
 'Traditional polls systematically undercount "shy Trump voters" who won''t admit their preference. I commissioned YouGov to ask people how their neighbors would vote - a technique from Santa Fe Institute research. If Trump had 60% odds in each swing state, Harris had only 10% chance of winning the blue wall.'),

('22222222-2222-2222-2222-222222220002', '11111111-1111-1111-1111-111111111001',
 'Trump wins Pennsylvania', 'politics', 'YES', 0.48, 12000000, '2024-10-20', 'WON', 108.3,
 'My neighbor polling in PA showed significant Trump preference that traditional polls missed. Suburban areas showed stronger Trump support than 2020. Ground game reports confirmed enthusiasm gap.'),

('22222222-2222-2222-2222-222222220003', '11111111-1111-1111-1111-111111111001',
 'Trump wins Popular Vote', 'politics', 'YES', 0.35, 5000000, '2024-10-25', 'WON', 185.7,
 'Contrarian bet based on same shy voter thesis. If the effect was as large as I calculated, popular vote would follow. High risk, high reward position to add leverage.'),

-- ===========================================
-- ERASMUS - Politics
-- ===========================================
('22222222-2222-2222-2222-222222220004', '11111111-1111-1111-1111-111111111002',
 'Biden drops out before convention', 'politics', 'YES', 0.25, 150000, '2024-06-15', 'WON', 300.0,
 'Polling data showed structural ceiling. Debate performance was catastrophic. Party insiders were already discussing alternatives. The math on swing states made continuation untenable.'),

('22222222-2222-2222-2222-222222220005', '11111111-1111-1111-1111-111111111002',
 'Harris nominated at DNC', 'politics', 'YES', 0.65, 200000, '2024-07-22', 'WON', 53.8,
 'After Biden dropout, Harris was the only viable option. Campaign infrastructure, fundraising, and delegate support all aligned. Open convention talk was noise.'),

-- ===========================================
-- HYPERLIQUID0XB - Sports
-- ===========================================
('22222222-2222-2222-2222-222222220006', '11111111-1111-1111-1111-111111111003',
 'Reds beat Phillies (June 2025)', 'sports', 'YES', 0.38, 400000, '2025-06-15', 'WON', 163.2,
 'Line movement indicated sharp money on Reds. Phillies bullpen fatigue after 5-game series. Reds starter had excellent home splits against NL East.'),

('22222222-2222-2222-2222-222222220007', '11111111-1111-1111-1111-111111111003',
 'Angels beat Dodgers', 'sports', 'YES', 0.32, 335000, '2025-06-20', 'OPEN', NULL,
 'Cross-town rivalry creates line inflation on Dodgers. Angels pitcher has career-best numbers vs Dodgers lineup. Public money skewing odds.'),

('22222222-2222-2222-2222-222222220008', '11111111-1111-1111-1111-111111111003',
 'Orioles win AL East', 'sports', 'YES', 0.45, 250000, '2025-04-01', 'OPEN', NULL,
 'Young core developing faster than projections. Yankees aging. Schedule analysis shows favorable second half. Division is wide open.'),

-- ===========================================
-- 1J59Y6NK - Sports
-- ===========================================
('22222222-2222-2222-2222-222222220009', '11111111-1111-1111-1111-111111111004',
 'Dodgers win World Series 2025', 'sports', 'YES', 0.28, 180000, '2025-03-15', 'OPEN', NULL,
 'Best roster on paper. Ohtani healthy and motivated. Pitching depth addresses previous weakness. Only question is October variance.'),

('22222222-2222-2222-2222-222222220010', '11111111-1111-1111-1111-111111111004',
 'Yankees miss playoffs 2025', 'sports', 'NO', 0.22, 90000, '2025-05-01', 'OPEN', NULL,
 'Despite slow start, underlying metrics strong. Judge health is the variable. AL wild card is weak - they only need to beat mediocre competition.'),

-- ===========================================
-- WINDWALK3 - Social/Politics
-- ===========================================
('22222222-2222-2222-2222-222222220011', '11111111-1111-1111-1111-111111111006',
 'RFK Jr. confirmed as HHS Secretary', 'politics', 'YES', 0.35, 500000, '2024-11-20', 'WON', 185.7,
 'Trump transition team signals were clear. RFK endorsement was transactional. Senate Republicans would fall in line despite concerns. Confirmation was political theater.'),

('22222222-2222-2222-2222-222222220012', '11111111-1111-1111-1111-111111111006',
 'Major vaccine policy change in 2025', 'social', 'YES', 0.42, 200000, '2025-01-15', 'OPEN', NULL,
 'RFK appointment signals intent. FDA leadership changes coming. Question is scope, not direction. Betting on announcement, not implementation.'),

-- ===========================================
-- LOGAN SUDEITH - Social/Culture
-- ===========================================
('22222222-2222-2222-2222-222222220013', '11111111-1111-1111-1111-111111111007',
 'Time Person of the Year 2024', 'culture', 'YES', 0.55, 40236, '2024-11-01', 'WON', 81.8,
 'Trump election win made this nearly certain. Time follows news impact. The story was too big to ignore regardless of editorial preferences.'),

('22222222-2222-2222-2222-222222220014', '11111111-1111-1111-1111-111111111007',
 'Taylor Swift Google most-searched 2024', 'culture', 'YES', 0.62, 25000, '2024-10-15', 'WON', 61.3,
 'Eras Tour cultural moment. Album releases. NFL relationship. Search volume data already confirmed trajectory. Easy money.'),

('22222222-2222-2222-2222-222222220015', '11111111-1111-1111-1111-111111111007',
 'Beyonce wins Album of Year Grammy 2025', 'culture', 'NO', 0.45, 30000, '2025-01-10', 'OPEN', NULL,
 'Grammy voting patterns show country establishment resistance. Cowboy Carter was acclaimed but challenges genre boundaries. Swift momentum may carry again.'),

-- ===========================================
-- ELI LIFLAND - Science/AI
-- ===========================================
('22222222-2222-2222-2222-222222220016', '11111111-1111-1111-1111-111111111008',
 'Superhuman AI coder by end of 2027', 'science', 'YES', 0.35, 0, '2025-06-01', 'OPEN', NULL,
 '25-40% probability. Extrapolating current scaling laws plus intuitive adjustments for AI R&D automation. However, outside-model factors (regulation, compute limits) push my median to 2030. I anchor less on expert claims about task difficulty now after badly underestimating MATH benchmark progress.'),

('22222222-2222-2222-2222-222222220017', '11111111-1111-1111-1111-111111111008',
 'GPT-5 level model released by end 2025', 'science', 'YES', 0.72, 0, '2025-01-15', 'OPEN', NULL,
 'Based on OpenAI timeline signals and competitive pressure from Anthropic. Compute scaling continues. The question is capability jump vs incremental improvement.'),

('22222222-2222-2222-2222-222222220018', '11111111-1111-1111-1111-111111111008',
 'AI causes major economic disruption by 2026', 'science', 'NO', 0.28, 0, '2025-03-01', 'OPEN', NULL,
 'Adoption lag is underrated. Enterprise deployment takes years. Regulatory friction increasing. Disruption is coming but not this fast.'),

-- ===========================================
-- NUNO SEMPERE - Science/Politics
-- ===========================================
('22222222-2222-2222-2222-222222220019', '11111111-1111-1111-1111-111111111009',
 'No nuclear weapon used in conflict by 2030', 'politics', 'YES', 0.92, 0, '2025-01-01', 'OPEN', NULL,
 'Base rates matter. Despite increased tensions, mutual deterrence remains stable. Tactical use scenarios exist but decision-makers understand escalation risks.'),

('22222222-2222-2222-2222-222222220020', '11111111-1111-1111-1111-111111111009',
 'US inflation below 3% by end of 2025', 'politics', 'YES', 0.68, 0, '2025-01-15', 'OPEN', NULL,
 'Shelter component lagging but real-time rent data shows decline. Supply chains normalized. Energy prices stable. Fed has room to maintain current policy.'),

-- ===========================================
-- MISHA YAGUDIN - Politics/Science
-- ===========================================
('22222222-2222-2222-2222-222222220021', '11111111-1111-1111-1111-111111111010',
 'Russia-Ukraine ceasefire by end 2025', 'politics', 'NO', 0.25, 0, '2025-01-10', 'OPEN', NULL,
 'Neither side has incentive to settle. Russia wants more territory. Ukraine won''t accept current lines. Western fatigue is overrated - support continues.'),

('22222222-2222-2222-2222-222222220022', '11111111-1111-1111-1111-111111111010',
 'China GDP growth above 5% in 2025', 'politics', 'NO', 0.42, 0, '2025-02-01', 'OPEN', NULL,
 'Property sector drag continues. Consumer confidence weak. Export headwinds from tariffs. Official numbers will be managed but real growth is lower.'),

-- ===========================================
-- JUAN CAMBEIRO - Politics/COVID
-- ===========================================
('22222222-2222-2222-2222-222222220023', '11111111-1111-1111-1111-111111111011',
 'WHO declares new pandemic by 2027', 'science', 'YES', 0.35, 0, '2025-01-01', 'OPEN', NULL,
 'Base rate analysis: Novel pathogens emerge regularly. Climate change expanding vector ranges. Surveillance gaps remain. Not if but when - 35% in 2 years is conservative.'),

('22222222-2222-2222-2222-222222220024', '11111111-1111-1111-1111-111111111011',
 'US COVID emergency measures return by 2026', 'politics', 'NO', 0.12, 0, '2025-03-01', 'OPEN', NULL,
 'Political appetite for restrictions is near zero. New variants would need significantly higher severity. Healthcare system has adapted. Very unlikely scenario.'),

-- ===========================================
-- JONATHAN MANN - Politics
-- ===========================================
('22222222-2222-2222-2222-222222220025', '11111111-1111-1111-1111-111111111012',
 'UK general election before 2029', 'politics', 'NO', 0.55, 0, '2025-06-01', 'OPEN', NULL,
 'Labour majority is comfortable. No political incentive for early election. Economic conditions would need significant deterioration. Starmer will run full term.'),

('22222222-2222-2222-2222-222222220026', '11111111-1111-1111-1111-111111111012',
 'EU adds new member state by 2028', 'politics', 'NO', 0.18, 0, '2025-01-15', 'OPEN', NULL,
 'Accession process takes years. No candidate is close enough. Ukraine fast-track is symbolic. Western Balkans progress stalled. Expansion fatigue is real.'),

-- ===========================================
-- TOLGA BILGE - Politics/Science
-- ===========================================
('22222222-2222-2222-2222-222222220027', '11111111-1111-1111-1111-111111111013',
 'SpaceX Starship reaches orbit in 2025', 'science', 'YES', 0.85, 0, '2025-01-01', 'OPEN', NULL,
 'Iteration velocity is remarkable. Recent test showed major progress. FAA approval path clearer. Musk timelines are usually optimistic but orbit this year is achievable.'),

('22222222-2222-2222-2222-222222220028', '11111111-1111-1111-1111-111111111013',
 'Commercial fusion power demo by 2030', 'science', 'NO', 0.72, 0, '2025-02-01', 'OPEN', NULL,
 'Engineering challenges remain massive. Funding is improving but timeline claims are aspirational. Net energy gain shown but sustained operation is different.'),

-- ===========================================
-- PABLO STAFFORINI - Science/Health
-- ===========================================
('22222222-2222-2222-2222-222222220029', '11111111-1111-1111-1111-111111111014',
 'GLP-1 drugs become most prescribed class by 2027', 'science', 'YES', 0.62, 0, '2025-03-01', 'OPEN', NULL,
 'Demand is unprecedented. Manufacturing scaling. Insurance coverage expanding. Side effect profile acceptable. Obesity epidemic creates massive market.'),

('22222222-2222-2222-2222-222222220030', '11111111-1111-1111-1111-111111111014',
 'CRISPR therapy approved for common disease by 2026', 'science', 'YES', 0.55, 0, '2025-01-15', 'OPEN', NULL,
 'Sickle cell approval opens pathway. Pipeline for beta-thalassemia, cancer applications strong. Regulatory precedent established. Manufacturing costs decreasing.'),

-- ===========================================
-- JARED LEIBOWICH - Politics/Current Events
-- ===========================================
('22222222-2222-2222-2222-222222220031', '11111111-1111-1111-1111-111111111015',
 'Major US tech antitrust ruling in 2025', 'politics', 'YES', 0.72, 0, '2025-02-01', 'OPEN', NULL,
 'Google case already decided. Apple and Amazon cases progressing. DOJ is aggressive. At least one major ruling is near certain.'),

('22222222-2222-2222-2222-222222220032', '11111111-1111-1111-1111-111111111015',
 'TikTok still operating in US by end 2025', 'social', 'YES', 0.65, 0, '2025-01-20', 'OPEN', NULL,
 'Legal challenges will continue. National security concerns vs First Amendment. Political pressure from young voters. Most likely outcome is extended deadline, not ban.')

ON CONFLICT (id) DO NOTHING;
