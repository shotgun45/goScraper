package main

import (
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// getH1FromHTML extracts the first <h1> text from the given HTML string.
func getH1FromHTML(html string) string {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return ""
	}
	h1 := doc.Find("h1").First()
	return h1.Text()
}

// getFirstParagraphFromHTML extracts the text of the first <p> tag, preferring <main> if present.
func getFirstParagraphFromHTML(html string) string {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return ""
	}
	// Try to find first <p> inside <main>
	main := doc.Find("main")
	if main.Length() > 0 {
		p := main.Find("p").First()
		if p.Length() > 0 {
			return p.Text()
		}
	}
	// Fallback to first <p> in document
	p := doc.Find("p").First()
	if p.Length() > 0 {
		return p.Text()
	}
	return ""
}

// getURLsFromHTML extracts all URLs from <a href> tags, converting relative URLs to absolute.
func getURLsFromHTML(htmlBody string, baseURL *url.URL) ([]string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlBody))
	if err != nil {
		return nil, err
	}
	var urls []string
	doc.Find("a[href]").Each(func(_ int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		u, err := url.Parse(href)
		if err != nil {
			return
		}
		abs := baseURL.ResolveReference(u)
		urls = append(urls, abs.String())
	})
	return urls, nil
}

func getImagesFromHTML(htmlBody string, baseURL *url.URL) ([]string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlBody))
	if err != nil {
		return nil, err
	}
	var urls []string
	doc.Find("img[src]").Each(func(_ int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if !exists {
			return
		}
		u, err := url.Parse(src)
		if err != nil {
			return
		}
		abs := baseURL.ResolveReference(u)
		urls = append(urls, abs.String())
	})
	return urls, nil
}
