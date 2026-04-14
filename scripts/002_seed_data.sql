-- Seed data for TuniVest
-- Sample investments for users to choose from

INSERT INTO investments (name, type, risk_level, expected_return, description, min_investment) VALUES
-- Low Risk Investments
('Tunisia Treasury Bonds', 'BONDS', 'LOW', 4.50, 'Government-backed treasury bonds with guaranteed returns. Safe investment for conservative investors.', 500),
('Savings Certificate', 'SAVINGS', 'LOW', 3.75, 'Bank savings certificates with fixed interest rates. FDIC insured up to 100,000 TND.', 100),
('Money Market Fund', 'FUND', 'LOW', 3.25, 'Low-risk money market fund investing in short-term debt securities.', 250),
('Islamic Sukuk', 'BONDS', 'LOW', 4.00, 'Sharia-compliant bonds backed by tangible assets.', 1000),

-- Medium Risk Investments
('BIAT Stock', 'STOCKS', 'MEDIUM', 8.50, 'Banque Internationale Arabe de Tunisie - Leading Tunisian bank stock.', 200),
('Tunisie Telecom', 'STOCKS', 'MEDIUM', 7.25, 'National telecommunications company with stable dividends.', 150),
('Real Estate Fund Tunisia', 'REAL_ESTATE', 'MEDIUM', 9.00, 'Diversified real estate investment trust focusing on commercial properties.', 2000),
('Balanced Mutual Fund', 'FUND', 'MEDIUM', 7.50, 'Mix of stocks and bonds for balanced growth and income.', 500),
('Poulina Group', 'STOCKS', 'MEDIUM', 8.00, 'Diversified industrial group with food, real estate, and manufacturing.', 300),

-- High Risk Investments
('Tech Startup Fund', 'VENTURE', 'HIGH', 15.00, 'Venture capital fund investing in Tunisian tech startups.', 5000),
('Cryptocurrency Index', 'CRYPTO', 'HIGH', 25.00, 'Diversified cryptocurrency portfolio tracking top 10 coins.', 100),
('Emerging Markets ETF', 'ETF', 'HIGH', 12.50, 'Exchange-traded fund focusing on emerging African markets.', 1000),
('Forex Trading Fund', 'FOREX', 'HIGH', 18.00, 'Managed forex trading fund with high volatility.', 2500),
('Agricultural Commodities', 'COMMODITIES', 'HIGH', 14.00, 'Investment in olive oil, dates, and citrus futures.', 1500);

-- Sample market data for the investments
INSERT INTO market_data (investment_id, price, trend)
SELECT id, 
    CASE risk_level
        WHEN 'LOW' THEN 100 + (RANDOM() * 10)
        WHEN 'MEDIUM' THEN 100 + (RANDOM() * 25)
        WHEN 'HIGH' THEN 100 + (RANDOM() * 50)
    END,
    CASE 
        WHEN RANDOM() < 0.33 THEN 'DOWN'
        WHEN RANDOM() < 0.66 THEN 'STABLE'
        ELSE 'UP'
    END
FROM investments;
