![General Assembly](/assets/ga-logo-white-background.png)

# Incident Pack: the Payday Push

> [!IMPORTANT]
> This is a fictional, composite incident, written for training. Wrenfield Bank does not exist. The incident is built from patterns common to real mass-logon capacity failures in retail banking, and every number in it is modelled, not measured. It is not a description of any real organisation's systems or of any real incident. Your course team may replace it with a sanitised real incident; if they do, the lab works the same way.

## What happened, in one paragraph

On a Friday payday, a push notification inviting 3.1 million customers to check their balance went out in a single send at 06:30. Within ten minutes, logons to the Wrenfield mobile app had risen more than sixfold, and for the next fifty minutes between four and nine in ten of them failed. Some customers who did get in saw a balance of £0.00. The services on GKE stayed healthy throughout. The incident was over by 07:25, after two changes that reduced demand, not capacity.

## What's in the pack

| File | What it is |
|---|---|
| `timeline.md` | Events, decisions and messages, in time order, from Thursday evening to Friday afternoon |
| `architecture-notes.md` | The logon journey, hop by hop: what each component is, who owns it, and its known limits |
| `metrics.csv` | One row per five minutes from 06:00 to 08:30: demand, success, latency, and each hop's load |

`metrics.csv` opens in Excel or LibreOffice Calc. Chart the columns you need; the lab tells you which.

One thing to know before you compare the metrics with the logon SLO. `logon_success_pct` counts logons that completed with all their profile data. The SLO counted HTTP status at the gateway. Most failed logons returned an error to the app, a timeout from the profile service, and the SLO saw those. The ones that came back 200 with an empty balance field, the £0.00 screens, counted as good.

## The columns in `metrics.csv`

| Column | What it counts |
|---|---|
| `time` | Start of the five-minute interval, UK time |
| `customers_trying_per_s` | Customers trying to log on, per second, including those coming back after failing |
| `logon_attempts_per_s` | Logon attempts reaching the gateway, per second, including the app's automatic retries |
| `logon_success_pct` | Share of attempts that completed with all profile data |
| `logon_p95_s` | 95th-percentile logon time, in seconds, measured at the gateway |
| `profile_calls_offered_per_s` | Calls the profile service sent to the integration bus, per second |
| `prof01_tasks_available` | Tasks the mainframe region PROF01 could give to online work (the rest held by batch) |
| `prof01_tasks_in_use` | Tasks PROF01 had busy |
| `prof01_completed_per_s` | Transactions PROF01 completed, per second |
| `prof01_useful_per_s` | Of those, how many had a caller still waiting for the answer |
| `calls_timed_out_per_s` | Profile calls that failed with a timeout, at the profile service or the integration bus, per second |
| `calls_rejected_fast_per_s` | Profile calls rejected at once by a concurrency limit, per second (the limit didn't exist until 07:35) |
| `profile_service_pods` | Pods running the profile service on GKE |
| `zero_balance_screens_per_min` | App screens that showed a balance of £0.00, per minute |
