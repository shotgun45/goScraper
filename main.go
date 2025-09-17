package main

import (
	"fmt"
	"net/url"
	"os"
	"sync"
	// Import writeCSVReport from csv_report.go (same package)
)

func main() {
	args := os.Args[1:]
	if len(args) == 0 {
		// No arguments: start API server for frontend
		StartAPIServer()
		return
	}

	// CLI mode (as before)
	maxConcurrency := 5
	maxPages := 100

	baseURL := args[0]
	// Optional: --maxConcurrency=N --maxPages=M
	for _, arg := range args[1:] {
		if len(arg) > 17 && arg[:17] == "--maxConcurrency=" {
			fmt.Sscanf(arg, "--maxConcurrency=%d", &maxConcurrency)
		} else if len(arg) > 10 && arg[:10] == "--maxPages=" {
			fmt.Sscanf(arg, "--maxPages=%d", &maxPages)
		}
	}

	fmt.Printf("starting crawl of: %s\n", baseURL)

	parsedBase, err := url.Parse(baseURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid base URL: %v\n", err)
		os.Exit(1)
	}
	cfg := &config{
		pages:              make(map[string]PageData),
		baseURL:            parsedBase,
		mu:                 &sync.Mutex{},
		concurrencyControl: make(chan struct{}, maxConcurrency),
		wg:                 &sync.WaitGroup{},
		maxPages:           maxPages,
	}

	cfg.crawlPage(baseURL)
	cfg.wg.Wait()

	// Write CSV report after crawling
	if err := writeCSVReport(cfg.pages, "report.csv"); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to write CSV report: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("\nCrawl complete. CSV report written to report.csv")
}
