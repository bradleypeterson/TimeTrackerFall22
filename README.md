# TimeTrackerV2
This is a pure Angular version of Weber State's TimeTracker App. Currently supports user registration and basic clock-in/clock-out.

## Startup Instructions
For first time startup, navigate to the directory containing the docker-compose.yml (this should be the root) and run the following command:
```bash
docker-compose up --build
```
For any subsequent startups, run
```bash
docker-compose up -d
```
The -d parameter will remove trailing logs, so omit it if you'd like logs to appear in the console. Only run with --build if you make changes to the package.json or config files on either project.
