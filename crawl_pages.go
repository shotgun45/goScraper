package main

import (
	"fmt"
	"net/url"
	"sync"
)

type config struct {
	pages              map[string]PageData
	baseURL            *url.URL
	mu                 *sync.Mutex
	concurrencyControl chan struct{}
	wg                 *sync.WaitGroup
	maxPages           int
}

// crawlPage recursively crawls a website, tracking internal links in the pages map.
func (cfg *config) crawlPage(rawCurrentURL string) {
	cfg.mu.Lock()
	if len(cfg.pages) >= cfg.maxPages {
		cfg.mu.Unlock()
		return
	}
	cfg.mu.Unlock()

	cfg.wg.Add(1)
	go func() {
		cfg.concurrencyControl <- struct{}{} // Acquire concurrency slot at goroutine start
		defer func() {
			<-cfg.concurrencyControl // Release slot
			cfg.wg.Done()
		}()

		currentParsed, err := url.Parse(rawCurrentURL)
		if err != nil {
			fmt.Printf("Invalid current URL: %s\n", rawCurrentURL)
			return
		}

		// Only crawl URLs on the same domain
		if cfg.baseURL.Hostname() != currentParsed.Hostname() {
			return
		}

		// Normalize current URL
		normalized := normalizeURL(rawCurrentURL)

		// Use addPageVisit helper
		isFirst := cfg.addPageVisit(normalized)
		if !isFirst {
			return
		}

		fmt.Printf("Crawling: %s\n", rawCurrentURL)

		html, err := getHTML(rawCurrentURL)
		if err != nil {
			fmt.Printf("Error fetching %s: %v\n", rawCurrentURL, err)
			return
		}

		// Extract and store page data
		pageData := extractPageData(html, rawCurrentURL)
		cfg.mu.Lock()
		cfg.pages[normalized] = pageData
		cfg.mu.Unlock()

		// Get all URLs from the page
		urls, err := getURLsFromHTML(html, currentParsed)
		if err != nil {
			fmt.Printf("Error extracting URLs from %s: %v\n", rawCurrentURL, err)
			return
		}

		for _, u := range urls {
			cfg.crawlPage(u)
		}
	}()
}

// addPageVisit checks if the page has been visited, adds it if not, and returns true if it's the first visit.
func (cfg *config) addPageVisit(url string) bool {
	cfg.mu.Lock()
	defer cfg.mu.Unlock()
	if len(cfg.pages) >= cfg.maxPages {
		return false
	}
	if _, exists := cfg.pages[url]; exists {
		return false
	}
	// Only mark as visited, don't store empty PageData here
	cfg.pages[url] = PageData{}
	return true
}
