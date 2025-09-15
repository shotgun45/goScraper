package main

import (
	"fmt"
	"net/url"
)

// crawlPage recursively crawls a website, tracking internal links in the pages map.
func crawlPage(rawBaseURL, rawCurrentURL string, pages map[string]int) {
	// Parse base and current URLs
	baseParsed, err := url.Parse(rawBaseURL)
	if err != nil {
		fmt.Printf("Invalid base URL: %s\n", rawBaseURL)
		return
	}
	currentParsed, err := url.Parse(rawCurrentURL)
	if err != nil {
		fmt.Printf("Invalid current URL: %s\n", rawCurrentURL)
		return
	}

	// Only crawl URLs on the same domain
	if baseParsed.Hostname() != currentParsed.Hostname() {
		return
	}

	// Normalize current URL
	normalized := normalizeURL(rawCurrentURL)

	// If already crawled, increment count and return
	if count, exists := pages[normalized]; exists {
		pages[normalized] = count + 1
		return
	}
	// Mark as crawled
	pages[normalized] = 1

	fmt.Printf("Crawling: %s\n", rawCurrentURL)

	html, err := getHTML(rawCurrentURL)
	if err != nil {
		fmt.Printf("Error fetching %s: %v\n", rawCurrentURL, err)
		return
	}

	// Get all URLs from the page
	urls, err := getURLsFromHTML(html, currentParsed)
	if err != nil {
		fmt.Printf("Error extracting URLs from %s: %v\n", rawCurrentURL, err)
		return
	}

	// Recursively crawl each found URL
	for _, u := range urls {
		crawlPage(rawBaseURL, u, pages)
	}
}
