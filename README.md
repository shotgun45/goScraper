# goScraper

## Overview
goScraper is a web crawler and scraper written in Go, with a modern TypeScript React frontend for easy use and CSV export.

## Project Structure

- `main.go` — Main entry point. Runs the API server (for frontend) or CLI crawl.
- `api_server.go` — HTTP API for frontend integration.
- `csv_report.go` — CSV export logic.
- `crawl_pages.go`, `get_html.go`, etc. — Core crawling and parsing logic.
- `frontend/` — React + TypeScript frontend (Vite-based).

## Running the Application


## Quick Start (Recommended)

From the project root, run:

```sh
chmod +x start.sh
./start.sh
```

This will start both the Go API server (on port 8080) and the React frontend (on port 5173). When you stop the frontend, the Go server will also be stopped.

## Manual Start (Advanced)

You can also start the servers manually:

1. **Start the Go Backend API**
	```sh
	go run .
	```
	This starts the API server at [http://localhost:8080](http://localhost:8080).

2. **Start the React Frontend**
	```sh
	cd frontend
	npm install
	npm run dev
	```
	This starts the frontend at [http://localhost:5173](http://localhost:5173).

## Using the App

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Enter a website URL, set crawl options, and start the crawl.
3. Results will appear in a table and can be exported as CSV.

## CLI Usage (Optional)

You can also run the crawler from the command line:

```sh
go run . https://example.com --maxConcurrency=5 --maxPages=100
```

## Notes
- The backend and frontend must both be running for the web UI to work.
- CORS is enabled for local development.
- The API returns a CSV file for each crawl request.
