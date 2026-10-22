![General Assembly](/assets/ga-logo-white-background.png)

# Timeline: the Payday Push

> [!IMPORTANT]
> Fictional, for training. See `README.md`. All times UK time. Metrics are in `metrics.csv`.

| Time | Source | Event |
|---|---|---|
| Thu 18:00 | Digital channels release notes | Mobile app 8.2 released: new on-device storage format |
| Fri 01:00 | Batch operations | Interest-posting batch starts in PROF01, holding 40 of its 120 tasks, as every night |
| 05:30 | Batch operations channel | "Interest run long tonight, extra volume from the rate change. ETA 07:00." Nobody on the digital rota reads this channel |
| 06:30 | Marketing platform | Payday push sent to 3.1 million customers in one send: "Payday's here. Tap to see your balance." |
| 06:34 | PROF01 (found later) | All 80 tasks available to online work are busy |
| 06:35 | Profile service and integration bus (found later) | Timeouts on profile calls begin |
| 06:40 | App analytics (found later) | Automatic retries now more than double the attempts: attempts rise faster than customers |
| 06:40 | GKE | profile-service scales from 8 to 32 pods on CPU |
| 06:41 | Social media | First public post: "@WrenfieldBank my balance says £0.00?? Payday!!" |
| 06:44 | Contact centre | Queue at 1,200 callers. Normal for 06:45 is about 40 |
| 06:47 | Alerting | Logon SLO fast-burn alert pages the digital on-call |
| 06:52 | Incident manager | Priority 1 incident declared. Bridge opened with digital, identity and cloud platform teams |
| 06:55 | Bridge | GKE services all healthy, CPU normal after scale-up. Logon errors point at the auth journey |
| 06:58 | Synthetic monitoring | The five-minute synthetic logon passes, as it has all morning |
| 07:02 | Identity team | auth-service rolled back to the previous version as a precaution. No change |
| 07:05 | Batch operations | Interest-posting batch completes. PROF01 has all 120 tasks for online work |
| 07:08 | Bridge | Success rises, but only to about a third. "The mainframe is fine, CPU is 71%" |
| 07:12 | Mainframe services, joining the bridge | PROF01 has been at its task limit since 06:34. About a quarter of transactions completed are for callers who have already timed out |
| 07:15 | Contact centre | Queue at 6,800. Social posts about £0.00 balances trending |
| 07:18 | Bridge decision | Switch off the offers banner (feature flag), and switch off the app's automatic retry (remote configuration) |
| 07:25 | Digital channels | Both flags live. The offers banner is off everywhere at once; the retry setting reaches about half of devices straight away and the rest by 07:35 |
| 07:25 | Metrics | Logon success back at 100% |
| 07:35 | Integration team | Limit of 110 concurrent calls from the integration bus to PROF01 added, rejecting the rest at once, as a guard |
| 07:50 | GKE | profile-service scales down to 16 pods |
| 08:30 | Incident manager | Incident resolved |
| 12:00 | Contact centre | 41,000 calls about the morning's problems, most about £0.00 balances |
| 15:00 | Communications | Public statement: "No customer's money was affected." |
