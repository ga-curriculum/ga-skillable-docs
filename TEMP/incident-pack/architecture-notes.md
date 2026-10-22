![General Assembly](/assets/ga-logo-white-background.png)

# Architecture Notes: the Wrenfield Mobile Logon Journey

> [!IMPORTANT]
> Fictional, for training. See `README.md`.

These notes were assembled for the post-incident review from four teams' documentation, which had never been put side by side before. Where a team didn't know a number, the notes say so.

## The journey

A customer opens the app and authenticates with a fingerprint or face. The app then shows the home screen: the customer's accounts, the balance of their main account, and an offers banner. Each of those three comes from a separate profile call, and the home screen waits for all three.

**Figure 01,** the logon path

![diagram](../../../../../../assets/module-3/module3-session2-lab3-4-architecture-note-1.png)

## The hops

| Hop | Owner | What it is | Known limits | What it does when it's full |
|---|---|---|---|---|
| Mobile app | Digital channels | iOS and Android app, about 4.1 million active users. Version 8.2 was released on Thursday evening | On a failed logon it retries automatically, twice, one second apart, then shows "Something went wrong". No random delay | Retries |
| Load balancer and API gateway | Cloud platform | Managed, autoscaling | Rate limit of 20,000 requests a second per region; never approached on the day | N/A |
| auth-service | Identity | Checks the credential, issues a session. GKE, autoscales on CPU, 6 to 40 pods | Session store sized for 5,000 logons a second | N/A on the day |
| profile-service | Digital channels | Makes the three profile calls through the integration bus and assembles the home screen. GKE, autoscales on CPU, 8 to 32 pods | Stops waiting for a profile call after 3 seconds | If one of the three calls fails, it returns HTTP 200 with that field empty, "so one slow call doesn't break the home screen" |
| Integration bus | Integration | Two on-premises nodes. Worker count not recorded; the integration team's guideline is "sized for 3,000 calls a second" | Gives up on a call 5 seconds after it arrives. Calls waiting for PROF01 are held in memory, with no limit on how many. No limit per backend | Holds the call, then times out and returns an error |
| Mainframe region PROF01 | Mainframe services | Runs the customer-profile transaction, about 60 ms each | MAXTASKS 120: at most 120 transactions at once. The overnight interest-posting batch holds 40 tasks while it runs, normally 01:00 to 05:30. It finished late twice in the previous year, both times on a Saturday | Queues. Purges a queued transaction only after it has waited 4 seconds. Once started, a transaction runs to the end even if its caller has given up |

## Monitoring, as it stood

- GKE dashboards per service: pod health, CPU, memory, request rate. All autoscaling alerts go to the platform team.
- A logon SLO, availability 99.5%, measured at the gateway from HTTP status codes, with a fast-burn alert to the digital on-call.
- A synthetic logon every five minutes, from one test account whose profile is cached by the integration bus.
- Mainframe: CICS region health checks and CPU, watched by mainframe operations, who are not on the digital incident rota. Batch progress is reported in the batch operations channel.

## Two details that mattered

- **App version 8.2** moved on-device storage to a new format, and cleared each device's cached balance on first launch. The app's balance widget shows the cached balance if the balance field is empty. With no cache, it shows £0.00.
- **The payday push** used to go out at 09:00, spread over an hour to avoid delivery lag. For this payday, marketing moved it to 06:30 "so customers see their pay before work", and sent it in a single batch to fix complaints that some customers got it late.
