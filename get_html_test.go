package main

import (
	"net/url"
	"reflect"
	"testing"
)

func TestGetH1FromHTML(t *testing.T) {
	cases := []struct {
		name     string
		html     string
		expected string
	}{
		{
			name:     "basic h1",
			html:     `<html><body><h1>Test Title</h1></body></html>`,
			expected: "Test Title",
		},
		{
			name:     "multiple h1",
			html:     `<h1>First</h1><h1>Second</h1>`,
			expected: "First",
		},
		{
			name:     "no h1",
			html:     `<div><p>No h1 here</p></div>`,
			expected: "",
		},
		{
			name:     "h1 with tags inside",
			html:     `<h1><span>Nested</span> Title</h1>`,
			expected: "Nested Title",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := getH1FromHTML(tc.html)
			if got != tc.expected {
				t.Errorf("%s: expected '%s', got '%s'", tc.name, tc.expected, got)
			}
		})
	}
}

func TestGetFirstParagraphFromHTML(t *testing.T) {
	cases := []struct {
		name     string
		html     string
		expected string
	}{
		{
			name:     "main with p",
			html:     `<main><p>First paragraph in main.</p><p>Second.</p></main><p>Outside main.</p>`,
			expected: "First paragraph in main.",
		},
		{
			name:     "no main, first p",
			html:     `<div><p>First paragraph.</p><p>Second.</p></div>`,
			expected: "First paragraph.",
		},
		{
			name:     "main without p, fallback",
			html:     `<main><div>No paragraph</div></main><p>Fallback paragraph.</p>`,
			expected: "Fallback paragraph.",
		},
		{
			name:     "no p tag",
			html:     `<div><span>No paragraph here</span></div>`,
			expected: "",
		},
		{
			name:     "first p outside main",
			html:     `<p>First outside main.</p><main><p>First in main.</p></main>`,
			expected: "First in main.",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := getFirstParagraphFromHTML(tc.html)
			if got != tc.expected {
				t.Errorf("%s: expected '%s', got '%s'", tc.name, tc.expected, got)
			}
		})
	}
}

func TestGetURLsFromHTMLAbsolute(t *testing.T) {
	inputURL := "https://blog.boot.dev"
	inputBody := `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`

	baseURL, err := url.Parse(inputURL)
	if err != nil {
		t.Errorf("couldn't parse input URL: %v", err)
		return
	}

	actual, err := getURLsFromHTML(inputBody, baseURL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := []string{"https://blog.boot.dev"}
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}

func TestGetURLsFromHTMLRelative(t *testing.T) {
	inputURL := "https://blog.boot.dev"
	inputBody := `<html><body><a href="/about">About</a></body></html>`

	baseURL, err := url.Parse(inputURL)
	if err != nil {
		t.Errorf("couldn't parse input URL: %v", err)
		return
	}

	actual, err := getURLsFromHTML(inputBody, baseURL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := []string{"https://blog.boot.dev/about"}
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}

func TestGetImagesFromHTMLRelative(t *testing.T) {
	inputURL := "https://blog.boot.dev"
	inputBody := `<html><body><img src="/logo.png" alt="Logo"></body></html>`

	baseURL, err := url.Parse(inputURL)

	if err != nil {
		t.Errorf("couldn't parse input URL: %v", err)
		return
	}

	actual, err := getImagesFromHTML(inputBody, baseURL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := []string{"https://blog.boot.dev/logo.png"}
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}
