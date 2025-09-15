package main

import (
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
