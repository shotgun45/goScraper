package main

import (
	"net/url"
	"strings"
)

// normalizeURL takes a URL string and returns a normalized version.
func normalizeURL(rawurl string) string {
	parsed, err := url.Parse(rawurl)
	if err != nil {
		return rawurl // return as-is if parsing fails
	}

	// Lowercase host
	host := strings.ToLower(parsed.Hostname())

	// Remove default port
	port := parsed.Port()
	if (parsed.Scheme == "http" && port == "80") || (parsed.Scheme == "https" && port == "443") {
		// ignore port
	} else if port != "" {
		host = host + ":" + port
	}

	// Remove trailing slash from path (except for root)
	path := parsed.Path
	if path != "/" && strings.HasSuffix(path, "/") {
		path = strings.TrimRight(path, "/")
	}
	// Remove fragment and query
	// Only host and path
	if path == "" || path == "/" {
		return host
	}
	return host + path
}
