package main

import (
	"fmt"
	"net/url"
	"os"
	"sync"
)

func main() {
	args := os.Args[1:]
	if len(args) < 1 {
		fmt.Println("no website provided")
		os.Exit(1)
	}
	if len(args) > 1 {
		fmt.Println("too many arguments provided")
		os.Exit(1)
	}
	baseURL := args[0]
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
		concurrencyControl: make(chan struct{}, 5),
		wg:                 &sync.WaitGroup{},
	}

	cfg.crawlPage(baseURL)
	cfg.wg.Wait()

	fmt.Println("\nCrawl complete. Pages found:")
	cfg.mu.Lock()
	for url := range cfg.pages {
		fmt.Printf("%s\n", url)
	}
	cfg.mu.Unlock()
}
