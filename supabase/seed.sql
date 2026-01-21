-- supabase/seed.sql
-- Seed data for The Guild - Masters and Bets

-- Insert Masters (20 total across categories)
INSERT INTO masters (id, username, display_name, bio, primary_markets) VALUES
-- Politics Masters (5)
('11111111-1111-1111-1111-111111111101', 'maria_macro', 'Maria Macro', 'Former Fed economist. Specializing in monetary policy and political markets.', ARRAY['politics']),
('11111111-1111-1111-1111-111111111102', 'capitol_insider', 'Capitol Insider', 'DC veteran with 20 years covering Congress. Election specialist.', ARRAY['politics']),
('11111111-1111-1111-1111-111111111103', 'poll_prophet', 'Poll Prophet', 'Data scientist. I build models, not opinions.', ARRAY['politics']),
('11111111-1111-1111-1111-111111111104', 'swing_state_sam', 'Swing State Sam', 'Based in Pennsylvania. Ground game intel is my edge.', ARRAY['politics']),
('11111111-1111-1111-1111-111111111105', 'global_affairs', 'Global Affairs', 'Former diplomat. International relations and geopolitics.', ARRAY['politics']),

-- Crypto Masters (5)
('11111111-1111-1111-1111-111111111201', 'defi_dave', 'DeFi Dave', 'On-chain analyst since 2017. Following the smart money.', ARRAY['crypto']),
('11111111-1111-1111-1111-111111111202', 'whale_watcher', 'Whale Watcher', 'Tracking large wallets and exchange flows. Data over vibes.', ARRAY['crypto']),
('11111111-1111-1111-1111-111111111203', 'protocol_pete', 'Protocol Pete', 'Deep dives into tokenomics and protocol mechanics.', ARRAY['crypto']),
('11111111-1111-1111-1111-111111111204', 'macro_maxi', 'Macro Maxi', 'Crypto through a macro lens. Fed, DXY, liquidity cycles.', ARRAY['crypto']),
('11111111-1111-1111-1111-111111111205', 'nft_nina', 'NFT Nina', 'Art, gaming, and digital collectibles. Culture meets crypto.', ARRAY['crypto']),

-- Sports Masters (5)
('11111111-1111-1111-1111-111111111301', 'sharp_money', 'Sharp Money', 'Former Vegas oddsmaker. Finding value in inefficient lines.', ARRAY['sports']),
('11111111-1111-1111-1111-111111111302', 'stats_guru', 'Stats Guru', 'Advanced analytics for NFL and NBA. Models beat gut.', ARRAY['sports']),
('11111111-1111-1111-1111-111111111303', 'injury_intel', 'Injury Intel', 'Physical therapist by day. Injury impact specialist.', ARRAY['sports']),
('11111111-1111-1111-1111-111111111304', 'futures_frank', 'Futures Frank', 'Long-term futures and championship markets only.', ARRAY['sports']),
('11111111-1111-1111-1111-111111111305', 'live_bet_lisa', 'Live Bet Lisa', 'In-game specialist. Momentum shifts are my bread and butter.', ARRAY['sports']),

-- Science/Tech Masters (3)
('11111111-1111-1111-1111-111111111401', 'ai_oracle', 'AI Oracle', 'ML researcher. Tracking AI progress and regulations.', ARRAY['science']),
('11111111-1111-1111-1111-111111111402', 'climate_calc', 'Climate Calc', 'Environmental scientist. Climate policy and weather markets.', ARRAY['science']),
('11111111-1111-1111-1111-111111111403', 'space_speculator', 'Space Speculator', 'Aerospace engineer. SpaceX, NASA, commercial space.', ARRAY['science']),

-- Culture/Other Masters (2)
('11111111-1111-1111-1111-111111111501', 'awards_ace', 'Awards Ace', 'Entertainment industry insider. Oscars, Emmys, and more.', ARRAY['culture']),
('11111111-1111-1111-1111-111111111502', 'trend_tracker', 'Trend Tracker', 'Viral content analyst. Social media and cultural moments.', ARRAY['culture'])
ON CONFLICT (id) DO NOTHING;

-- Insert Master Stats
INSERT INTO master_stats (master_id, total_bets, wins, losses, pending, win_rate, total_return, avg_return, current_streak, best_streak, contrarian_score, rank) VALUES
('11111111-1111-1111-1111-111111111101', 45, 28, 15, 2, 65.1, 142.5, 3.2, 3, 7, 72, 1),
('11111111-1111-1111-1111-111111111102', 38, 22, 14, 2, 61.1, 98.3, 2.6, -2, 5, 45, 2),
('11111111-1111-1111-1111-111111111103', 52, 31, 18, 3, 63.3, 125.0, 2.4, 4, 8, 58, 3),
('11111111-1111-1111-1111-111111111104', 29, 18, 10, 1, 64.3, 89.5, 3.1, 2, 4, 65, 4),
('11111111-1111-1111-1111-111111111105', 33, 19, 12, 2, 61.3, 76.2, 2.3, 1, 5, 78, 5),
('11111111-1111-1111-1111-111111111201', 67, 38, 26, 3, 59.4, 167.8, 2.5, -1, 6, 82, 6),
('11111111-1111-1111-1111-111111111202', 41, 24, 15, 2, 61.5, 112.4, 2.7, 3, 5, 55, 7),
('11111111-1111-1111-1111-111111111203', 35, 20, 13, 2, 60.6, 85.6, 2.4, 2, 4, 68, 8),
('11111111-1111-1111-1111-111111111204', 48, 26, 19, 3, 57.8, 78.9, 1.6, -3, 5, 42, 9),
('11111111-1111-1111-1111-111111111205', 23, 13, 9, 1, 59.1, 45.2, 2.0, 1, 3, 71, 10),
('11111111-1111-1111-1111-111111111301', 89, 52, 34, 3, 60.5, 198.7, 2.2, 4, 9, 38, 11),
('11111111-1111-1111-1111-111111111302', 72, 41, 28, 3, 59.4, 145.3, 2.0, 2, 6, 52, 12),
('11111111-1111-1111-1111-111111111303', 44, 26, 16, 2, 61.9, 95.4, 2.2, 3, 5, 61, 13),
('11111111-1111-1111-1111-111111111304', 18, 11, 6, 1, 64.7, 68.9, 3.8, 2, 4, 75, 14),
('11111111-1111-1111-1111-111111111305', 56, 30, 23, 3, 56.6, 67.2, 1.2, -1, 4, 48, 15),
('11111111-1111-1111-1111-111111111401', 31, 19, 10, 2, 65.5, 108.4, 3.5, 5, 6, 85, 16),
('11111111-1111-1111-1111-111111111402', 27, 15, 11, 1, 57.7, 42.1, 1.6, 1, 4, 79, 17),
('11111111-1111-1111-1111-111111111403', 22, 13, 8, 1, 61.9, 58.3, 2.7, 2, 3, 88, 18),
('11111111-1111-1111-1111-111111111501', 34, 21, 12, 1, 63.6, 87.5, 2.6, 3, 5, 44, 19),
('11111111-1111-1111-1111-111111111502', 19, 10, 8, 1, 55.6, 28.4, 1.5, -1, 3, 67, 20)
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

-- Insert Bets with Reasoning (40+ bets)
INSERT INTO bets (id, master_id, market_question, market_category, side, entry_odds, entry_amount, entry_date, status, return_pct, reasoning) VALUES
-- Maria Macro (Politics)
('22222222-2222-2222-2222-222222220101', '11111111-1111-1111-1111-111111111101', 'Fed cuts rates by March 2026?', 'politics', 'YES', 0.42, 500, '2025-12-15', 'OPEN', NULL, 'Labor market cooling faster than headline numbers suggest. December JOLTS data will confirm.'),
('22222222-2222-2222-2222-222222220102', '11111111-1111-1111-1111-111111111101', 'Biden approval above 45% by Feb?', 'politics', 'NO', 0.35, 300, '2025-12-10', 'WON', 28.5, 'Structural ceiling around 43%. No catalyst for improvement.'),
('22222222-2222-2222-2222-222222220103', '11111111-1111-1111-1111-111111111101', 'US GDP Q4 above 2%?', 'politics', 'YES', 0.65, 400, '2025-11-20', 'WON', 15.2, 'Consumer spending resilient. Holiday retail numbers tracking strong.'),

-- Capitol Insider (Politics)
('22222222-2222-2222-2222-222222220201', '11111111-1111-1111-1111-111111111102', 'Government shutdown before March?', 'politics', 'NO', 0.28, 600, '2026-01-05', 'OPEN', NULL, 'Neither party wants the blame. CR extension is the path of least resistance.'),
('22222222-2222-2222-2222-222222220202', '11111111-1111-1111-1111-111111111102', 'Immigration bill passes Senate?', 'politics', 'NO', 0.22, 400, '2026-01-10', 'OPEN', NULL, 'Election year politics makes this DOA. No compromise possible.'),

-- Poll Prophet (Politics)
('22222222-2222-2222-2222-222222220301', '11111111-1111-1111-1111-111111111103', 'Trump wins Republican primary?', 'politics', 'YES', 0.78, 800, '2025-10-01', 'WON', 8.5, 'Model gives him 91% probability. Field too fragmented.'),
('22222222-2222-2222-2222-222222220302', '11111111-1111-1111-1111-111111111103', 'Generic ballot Dem+3 or better in Feb?', 'politics', 'NO', 0.38, 350, '2026-01-15', 'OPEN', NULL, 'Historical mean reversion pattern. Economy not bad enough for wave.'),

-- DeFi Dave (Crypto)
('22222222-2222-2222-2222-222222220401', '11111111-1111-1111-1111-111111111201', 'ETH above $4000 by March?', 'crypto', 'YES', 0.52, 1000, '2026-01-01', 'OPEN', NULL, 'ETF inflows accelerating. Institutional allocation just starting.'),
('22222222-2222-2222-2222-222222220402', '11111111-1111-1111-1111-111111111201', 'Solana flips Ethereum in TVL?', 'crypto', 'NO', 0.15, 400, '2025-12-20', 'WON', 18.7, 'Apples to oranges. ETH L2s need to be counted.'),
('22222222-2222-2222-2222-222222220403', '11111111-1111-1111-1111-111111111201', 'Bitcoin hits new ATH in Q1?', 'crypto', 'YES', 0.68, 750, '2025-12-15', 'OPEN', NULL, 'Halving supply shock + ETF demand = price discovery.'),

-- Whale Watcher (Crypto)
('22222222-2222-2222-2222-222222220501', '11111111-1111-1111-1111-111111111202', 'Major exchange hack in 2026?', 'crypto', 'YES', 0.35, 300, '2026-01-01', 'OPEN', NULL, 'Statistical inevitability. $200M+ hack happens every 18 months on average.'),
('22222222-2222-2222-2222-222222220502', '11111111-1111-1111-1111-111111111202', 'Tether depegs below $0.99?', 'crypto', 'NO', 0.12, 500, '2025-11-01', 'WON', 12.5, 'Attestations improving. Too big to fail at this point.'),

-- Sharp Money (Sports)
('22222222-2222-2222-2222-222222220601', '11111111-1111-1111-1111-111111111301', 'Chiefs win Super Bowl?', 'sports', 'YES', 0.22, 600, '2025-09-01', 'OPEN', NULL, 'Mahomes in playoff mode is unstoppable. Line is disrespecting them.'),
('22222222-2222-2222-2222-222222220602', '11111111-1111-1111-1111-111111111301', 'Lakers make playoffs?', 'sports', 'YES', 0.58, 400, '2025-11-15', 'OPEN', NULL, 'LeBron load management working. They will turn it on in March.'),
('22222222-2222-2222-2222-222222220603', '11111111-1111-1111-1111-111111111301', 'Ohtani MVP?', 'sports', 'YES', 0.45, 500, '2025-04-01', 'WON', 32.2, 'Dodgers offense + his two-way numbers. No one else close.'),

-- Stats Guru (Sports)
('22222222-2222-2222-2222-222222220701', '11111111-1111-1111-1111-111111111302', 'Ravens over 11.5 wins?', 'sports', 'YES', 0.55, 450, '2025-08-15', 'WON', 18.2, 'Schedule analysis shows 4 cupcakes late. Lamar staying healthy.'),
('22222222-2222-2222-2222-222222220702', '11111111-1111-1111-1111-111111111302', 'Celtics best record in East?', 'sports', 'YES', 0.42, 350, '2025-10-20', 'OPEN', NULL, 'Net rating is elite. Depth carries them through injuries.'),

-- AI Oracle (Science)
('22222222-2222-2222-2222-222222220801', '11111111-1111-1111-1111-111111111401', 'GPT-5 released before July 2026?', 'science', 'YES', 0.62, 400, '2025-11-01', 'OPEN', NULL, 'OpenAI timeline suggests Q2. Competitive pressure from Anthropic accelerating.'),
('22222222-2222-2222-2222-222222220802', '11111111-1111-1111-1111-111111111401', 'AI regulation passes in EU?', 'science', 'YES', 0.75, 300, '2025-10-15', 'WON', 10.5, 'AI Act already in motion. Implementation is the only question.'),
('22222222-2222-2222-2222-222222220803', '11111111-1111-1111-1111-111111111401', 'Humanoid robots commercially available?', 'science', 'NO', 0.18, 250, '2026-01-01', 'OPEN', NULL, 'Manufacturing scale not there. 2027 at earliest for real deployment.'),

-- Awards Ace (Culture)
('22222222-2222-2222-2222-222222220901', '11111111-1111-1111-1111-111111111501', 'Oppenheimer wins Best Picture?', 'culture', 'YES', 0.55, 400, '2024-01-15', 'WON', 21.8, 'Campaign momentum + Academy loves epics. Nolan finally gets his due.'),
('22222222-2222-2222-2222-222222220902', '11111111-1111-1111-1111-111111111501', 'Taylor Swift album of the year?', 'culture', 'YES', 0.48, 300, '2025-01-20', 'OPEN', NULL, 'Grammy loves her. Eras Tour cultural moment too big to ignore.'),

-- More variety bets
('22222222-2222-2222-2222-222222221001', '11111111-1111-1111-1111-111111111104', 'PA goes blue in 2024?', 'politics', 'YES', 0.52, 500, '2024-06-01', 'WON', 19.2, 'Ground game + suburban shift. I see it firsthand here.'),
('22222222-2222-2222-2222-222222221002', '11111111-1111-1111-1111-111111111105', 'Ukraine NATO membership by 2026?', 'politics', 'NO', 0.08, 300, '2025-06-01', 'OPEN', NULL, 'Active conflict prevents Article 5 activation. Security guarantees instead.'),
('22222222-2222-2222-2222-222222221003', '11111111-1111-1111-1111-111111111203', 'Ethereum L2 TVL exceeds L1?', 'crypto', 'YES', 0.65, 500, '2025-09-01', 'OPEN', NULL, 'Already at 60%. Arbitrum + Base growth trajectory clear.'),
('22222222-2222-2222-2222-222222221004', '11111111-1111-1111-1111-111111111204', 'BTC correlates with S&P 500 above 0.7?', 'crypto', 'NO', 0.42, 350, '2025-12-01', 'WON', 22.8, 'Halving cycle decoupling starting. Different buyer base now.'),
('22222222-2222-2222-2222-222222221005', '11111111-1111-1111-1111-111111111303', 'Tua finishes season healthy?', 'sports', 'NO', 0.45, 400, '2025-09-01', 'WON', 22.2, 'History says no. Three concussions changes everything.'),
('22222222-2222-2222-2222-222222221006', '11111111-1111-1111-1111-111111111304', 'Warriors win championship?', 'sports', 'NO', 0.12, 300, '2025-10-01', 'OPEN', NULL, 'Window closed. Curry alone is not enough anymore.'),
('22222222-2222-2222-2222-222222221007', '11111111-1111-1111-1111-111111111402', 'Record global temperature in 2026?', 'science', 'YES', 0.72, 350, '2025-12-01', 'OPEN', NULL, 'El Nino persistence + baseline warming. Virtually certain.'),
('22222222-2222-2222-2222-222222221008', '11111111-1111-1111-1111-111111111403', 'SpaceX Starship orbital success?', 'science', 'YES', 0.78, 400, '2025-08-01', 'WON', 12.8, 'Iteration velocity is insane. FAA approval was the real barrier.'),
('22222222-2222-2222-2222-222222221009', '11111111-1111-1111-1111-111111111502', 'TikTok banned in US?', 'culture', 'NO', 0.35, 300, '2025-06-01', 'OPEN', NULL, 'Courts will block. First Amendment issues too messy.'),
('22222222-2222-2222-2222-222222221010', '11111111-1111-1111-1111-111111111101', 'Inflation below 3% by June?', 'politics', 'YES', 0.58, 450, '2026-01-10', 'OPEN', NULL, 'Shelter component lagging. Real-time rents already falling.'),
('22222222-2222-2222-2222-222222221011', '11111111-1111-1111-1111-111111111201', 'Coinbase stock above $300?', 'crypto', 'YES', 0.42, 350, '2026-01-05', 'OPEN', NULL, 'ETF custody fees printing money. Most undervalued crypto stock.'),
('22222222-2222-2222-2222-222222221012', '11111111-1111-1111-1111-111111111301', 'Patrick Mahomes MVP?', 'sports', 'NO', 0.32, 400, '2025-09-01', 'OPEN', NULL, 'Voter fatigue is real. They will find someone else to crown.'),
('22222222-2222-2222-2222-222222221013', '11111111-1111-1111-1111-111111111401', 'Apple releases AR glasses in 2026?', 'science', 'YES', 0.45, 300, '2025-11-01', 'OPEN', NULL, 'Vision Pro was the dev kit. Consumer version coming holiday 2026.'),
('22222222-2222-2222-2222-222222221014', '11111111-1111-1111-1111-111111111103', 'Third party candidate gets 5% of vote?', 'politics', 'NO', 0.25, 350, '2025-12-01', 'OPEN', NULL, 'No Labels failed. RFK peaked too early. Classic third party fade.'),
('22222222-2222-2222-2222-222222221015', '11111111-1111-1111-1111-111111111205', 'Pudgy Penguins floor above 10 ETH?', 'crypto', 'YES', 0.38, 250, '2025-12-15', 'OPEN', NULL, 'Walmart deal is real. First NFT brand to go mainstream retail.'),
('22222222-2222-2222-2222-222222221016', '11111111-1111-1111-1111-111111111305', 'Super Bowl total over 48.5?', 'sports', 'YES', 0.52, 400, '2026-01-15', 'OPEN', NULL, 'High-powered offenses remaining. Defenses tired in February.')
ON CONFLICT (id) DO NOTHING;
