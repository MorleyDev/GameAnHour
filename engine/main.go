package main

import (
	"fmt"
	"image/color"
	"io/ioutil"
	"reflect"
	"time"

	"github.com/faiface/pixel"
	"github.com/faiface/pixel/imdraw"
	"github.com/faiface/pixel/pixelgl"
	"github.com/faiface/pixel/text"
	"golang.org/x/image/colornames"
	"golang.org/x/image/font/basicfont"
)

func extractFloat64(value interface{}) float64 {
	switch c := value.(type) {
	case int64:
		return float64(c)
	case float64:
		return c
	default:
		panic("Value was not int64 or float64 but was " + reflect.TypeOf(c).String())
	}
}
func extractInt64(value interface{}) int64 {
	switch c := value.(type) {
	case int64:
		return c
	case float64:
		return int64(c)
	default:
		panic("Value was not int64 or float64 but was " + reflect.TypeOf(c).String())
	}
}

func mapToColour(colour map[string]interface{}) color.RGBA {
	return color.RGBA{uint8(extractInt64(colour["r"])), uint8(extractInt64(colour["g"])), uint8(extractInt64(colour["b"])), uint8(extractFloat64(colour["a"]) / 255.0)}
}

func renderCommand(window *pixelgl.Window, target pixel.Target, atlas *text.Atlas, matrix pixel.Matrix, command string, data []interface{}) {
	switch command {
	case "clear":
		if target == window {
			if len(data) == 0 {
				window.Clear(colornames.Black)
			} else {
				colour := mapToColour(data[0].(map[string]interface{}))
				window.Clear(colour)
			}
		} else {
			panic("rendertarget not supported")
		}
		return

	case "origin":
		translate := data[0].(map[string]interface{})
		translateX := extractFloat64(translate["x"])
		translateY := -extractFloat64(translate["y"])
		frames := data[1].([]interface{})

		renderFrame(window, target, atlas, matrix.Moved(pixel.V(translateX, translateY)), frames)
		return

	case "scale":
		scale := data[0].(map[string]interface{})
		scaleX := extractFloat64(scale["x"])
		scaleY := extractFloat64(scale["y"])
		frames := data[1].([]interface{})
		renderFrame(window, target, atlas, matrix.ScaledXY(pixel.V(0, 0), pixel.V(scaleX, scaleY)), frames)
		return

	case "rotation":
		radians := extractFloat64(data[0])
		frames := data[1].([]interface{})
		renderFrame(window, target, atlas, matrix.Rotated(pixel.V(0, 0), radians), frames)
		return

	case "stroke":
	case "fill":
		colour := mapToColour(data[1].(map[string]interface{}))

		switch shape := data[0].(type) {
		case []interface{}:
			imd := imdraw.New(nil)
			imd.SetMatrix(matrix)
			imd.Color = colour
			for _, point := range shape {
				p := point.(map[string]interface{})
				imd.Push(pixel.V(extractFloat64(p["x"]), -extractFloat64(p["y"])))
			}
			imd.Polygon(0)
			imd.Draw(target)
			return

		case map[string]interface{}:
			x := extractFloat64(shape["x"])
			y := -extractFloat64(shape["y"])

			colour := mapToColour(data[1].(map[string]interface{}))
			radius, okRadius := shape["radius"]
			if okRadius {
				r := extractFloat64(radius)
				imd := imdraw.New(nil)
				imd.SetMatrix(matrix)
				imd.Color = colour
				imd.Push(pixel.V(x, y))
				imd.Circle(r, 0)
				imd.Draw(target)
				return
			}

			width, okWidth := shape["width"]
			height, okHeight := shape["height"]
			if okWidth && okHeight {
				w := extractFloat64(width)
				h := extractFloat64(height)

				imd := imdraw.New(nil)
				imd.SetMatrix(matrix)
				imd.Color = colour
				imd.Push(pixel.V(x, y))
				imd.Push(pixel.V(x+w, y))
				imd.Push(pixel.V(x+w, y+h))
				imd.Push(pixel.V(x, y+h))
				imd.Polygon(0)
				return
			}

			txt, okText := shape["text"]
			if okText {
				basicTxt := text.New(pixel.V(x, y), atlas)
				fmt.Fprintln(basicTxt, txt.(string))
				basicTxt.Draw(target, matrix)
			}
			return
		default:
			println("fill:unknown")
			return
		}
	case "rendertarget":
		panic("rendertarget is not supported")
	}
}

func renderFrame(window *pixelgl.Window, target pixel.Target, atlas *text.Atlas, matrix pixel.Matrix, frame []interface{}) {
	if len(frame) == 0 {
		return
	}
	switch t := frame[0].(type) {
	case []interface{}:
		for _, elementRaw := range frame {
			renderFrame(window, target, atlas, matrix, elementRaw.([]interface{}))
		}
		return
	case string:
		renderCommand(window, target, atlas, matrix, t, frame[1:])
		return
	default:
		panic("unknown frame command")
	}
}

func run(frames chan interface{}) func() {
	return func() {
		e := CreateEngine()
		data, err := ioutil.ReadFile("../dist/engine.js")
		if err != nil {
			panic(err)
		}
		src := string(data)

		_, runtimeError := e.RunString(src)
		if runtimeError != nil {
			panic(runtimeError)
		}

		cfg := pixelgl.WindowConfig{Title: "Pixel Rocks!", Bounds: pixel.R(0, 0, 512, 512), VSync: true}
		win, err := pixelgl.NewWindow(cfg)
		if err != nil {
			panic(err)
		}
		basicAtlas := text.NewAtlas(basicfont.Face7x13, text.ASCII)

		for !win.Closed() {
			frameRaw := <-frames

			renderFrame(win, win, basicAtlas, pixel.IM.Moved(pixel.V(0, 512)), frameRaw.([]interface{}))
			win.Update()
		}
	}
}

func game(frames chan interface{}) {
	e := CreateEngine()
	data, err := ioutil.ReadFile("../dist/engine.js")
	if err != nil {
		panic(err)
	}
	src := string(data)

	_, runtimeError := e.RunString(src)
	if runtimeError != nil {
		panic(runtimeError)
	}

	e.Bootstrap()

	interval := time.Duration(1) * time.Millisecond
	for range time.Tick(interval) {
		e.Tick(interval)
		e.Animate()
		e.Flush()

		frame, err := e.frameRenderer(nil, e.latestState)
		if err != nil {
			panic(err)
		}

		trueFrame := frame.Export()
		frames <- trueFrame
	}
}

func main() {
	frames := make(chan interface{})
	go game(frames)

	pixelgl.Run(run(frames))
}
