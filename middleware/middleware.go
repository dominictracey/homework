package main

import (
	"crypto/sha1"
	"encoding/hex"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"sort"
	"strconv"
)

const (
	crlf       = "\r\n"
	colonspace = ": "
)

// ChecksumMiddleware inserts SHA-1 checksums and passes on to next handler
func ChecksumMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// create a fake writer so we can look ahead at the base headers
		fakeW := httptest.NewRecorder()
		h.ServeHTTP(fakeW, r)

		can := fmt.Sprintf("%d", fakeW.Code)
		can += crlf

		// create an array of the header names for sorting
		var keys []string
		for k := range fakeW.Header() {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		// add the sorted headers
		headers := ""
		i := 0
		for _, key := range keys {
			can += key + ": " + fakeW.Header().Get(key) + crlf
			headers += key
			// no trailing semicolon
			if i < len(keys)-1 {
				headers += ";"
				i++
			}
		}

		can += "X-Checksum-Headers: " + headers + crlf + crlf

		body := fakeW.Body.String()
		fmt.Println("BODY: " + body)
		can += body

		// now we can calculate the hash
		hasher := sha1.New()
		hasher.Write([]byte(can))
		src := hasher.Sum(nil)
		dst := make([]byte, hex.EncodedLen(len(src)))
		hex.Encode(dst, src)

		// insert checksum headers in the real response
		w.Header().Set("X-Checksum-Headers", headers)
		w.Header().Set("X-Checksum", string(dst))

		h.ServeHTTP(w, r)
	})
}

// Do not change this function.
func main() {
	var listenAddr = flag.String("http", "localhost:8080", "address to listen on for HTTP")
	flag.Parse()

	http.Handle("/", ChecksumMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Foo", "bar")
		w.Header().Set("Content-Type", "text/plain")
		w.Header().Set("Date", "Sun, 08 May 2016 14:04:53 GMT")
		msg := "Curiosity is insubordination in its purest form.\n"
		w.Header().Set("Content-Length", strconv.Itoa(len(msg)))
		fmt.Fprintf(w, msg)
	})))

	log.Fatal(http.ListenAndServe(*listenAddr, nil))
}
