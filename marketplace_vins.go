package main

import (
	"fmt"
	"io/ioutil"
)

func main() {
	corps, _ := ioutil.ReadFile("vins.json")
	fmt.Println(string(corps))
}
