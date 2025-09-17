package main

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
)

// StartAPIServer starts an HTTP server for the frontend to trigger crawls and get CSV.
func StartAPIServer() {
	http.HandleFunc("/api/crawl", func(w http.ResponseWriter, r *http.Request) {
		// Allow CORS for local frontend
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		url := r.URL.Query().Get("url")
		maxConcurrencyStr := r.URL.Query().Get("maxConcurrency")
		maxPagesStr := r.URL.Query().Get("maxPages")

		if url == "" {
			http.Error(w, "Missing url parameter", http.StatusBadRequest)
			return
		}
		maxConcurrency, _ := strconv.Atoi(maxConcurrencyStr)
		if maxConcurrency <= 0 {
			maxConcurrency = 5
		}
		maxPages, _ := strconv.Atoi(maxPagesStr)
		if maxPages <= 0 {
			maxPages = 100
		}

		// Set up config and run crawl (reuse logic from main.go)
		parsedBase, err := parseBaseURL(url)
		if err != nil {
			http.Error(w, "Invalid base URL", http.StatusBadRequest)
			return
		}
		cfg := &config{
			pages:              make(map[string]PageData),
			baseURL:            parsedBase,
			mu:                 new(sync.Mutex),
			concurrencyControl: make(chan struct{}, maxConcurrency),
			wg:                 new(sync.WaitGroup),
			maxPages:           maxPages,
		}
		cfg.crawlPage(url)
		cfg.wg.Wait()

		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", "attachment; filename=report.csv")
		if err := writeCSVReportHTTP(cfg.pages, w); err != nil {
			http.Error(w, fmt.Sprintf("Failed to write CSV: %v", err), http.StatusInternalServerError)
		}
	})
	fmt.Println("API server running on http://localhost:8080 ...")
	http.ListenAndServe(":8080", nil)
}

// Helper to parse base URL (for DRYness)
func parseBaseURL(raw string) (*url.URL, error) {
	return url.Parse(raw)
}

// writeCSVReportHTTP writes CSV to an http.ResponseWriter
func writeCSVReportHTTP(pages map[string]PageData, w http.ResponseWriter) error {
	// Reuse logic from writeCSVReport, but write to w
	writer := csv.NewWriter(w)
	defer writer.Flush()
	header := []string{"page_url", "h1", "first_paragraph", "outgoing_link_urls", "image_urls"}
	if err := writer.Write(header); err != nil {
		return err
	}
	for _, page := range pages {
		record := []string{
			page.URL,
			page.H1,
			page.FirstParagraph,
			strings.Join(page.OutgoingLinks, ";"),
			strings.Join(page.ImageURLs, ";"),
		}
		if err := writer.Write(record); err != nil {
			return err
		}
	}
	return nil
}
