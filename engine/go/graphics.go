package main

import (
	"fmt"
	"image/color"
	"time"

	"github.com/faiface/pixel"
	"github.com/faiface/pixel/imdraw"
	"github.com/faiface/pixel/pixelgl"
	"github.com/faiface/pixel/text"
	"golang.org/x/image/colornames"
	"golang.org/x/image/font/basicfont"
)

type MouseEvent struct {
	position pixel.Vec
}

type ClickEvent struct {
	position pixel.Vec
	button   int8
}

type InputEmitter struct {
	mouseDown chan<- ClickEvent
	mouseUp   chan<- ClickEvent
	mouseMove chan<- MouseEvent
}

type GraphicsEvents struct {
	endIn               <-chan interface{}
	endOut              chan<- interface{}
	renderingCommandsIn <-chan []RenderingCommand

	input InputEmitter
}

const (
	Clear         = iota
	ClearColour   = iota
	DrawPolygon   = iota
	DrawCircle    = iota
	DrawRectangle = iota
	DrawText      = iota
	Origin        = iota
	Rotate        = iota
	Scale         = iota
	RenderTarget  = iota
)

const (
	Stroke = iota
	Fill   = iota
)

type RenderingCommand struct {
	command  int
	format   int
	points   []pixel.Vec
	location pixel.Vec
	radius   float64
	width    float64
	height   float64
	text     string
	colour   color.RGBA
	angle    float64
	children []RenderingCommand
}

type GraphicsWindow struct {
	events GraphicsEvents
}

func NewWindow(events GraphicsEvents) *GraphicsWindow {
	return &GraphicsWindow{events}
}

func (w *GraphicsWindow) Run() {
	pixelgl.Run(run(w))
}

func run(w *GraphicsWindow) func() {
	return func() {
		cfg := pixelgl.WindowConfig{Title: "GAM", Bounds: pixel.R(0, 0, 512, 512), VSync: true}
		win, err := pixelgl.NewWindow(cfg)
		if err != nil {
			panic(err)
		}

		basicAtlas := text.NewAtlas(basicfont.Face7x13, text.ASCII)
		frameCounter := 0
		second := time.Tick(time.Second)
		for {
			select {
			case <-w.events.endIn:
				w.events.endOut <- 0
				return

			case <-second:
				win.SetTitle(fmt.Sprintf("%s | FPS: %d", cfg.Title, frameCounter))
				frameCounter = 0

			default:
				frameCounter++
				win.Update()
				if win.Closed() {
					w.events.endOut <- 0
					return
				}

				if win.JustPressed(pixelgl.MouseButtonLeft) {
					w.events.input.mouseDown <- ClickEvent{position: win.MousePosition(), button: 0}
				}
				if win.JustReleased(pixelgl.MouseButtonLeft) {
					w.events.input.mouseUp <- ClickEvent{position: win.MousePosition(), button: 0}
				}

				latestFrame := w.getLatestFrame()
				if latestFrame != nil {
					renderCommands(win, win, basicAtlas, pixel.IM, latestFrame)
				}
			}
		}
	}
}

func (w *GraphicsWindow) getLatestFrame() []RenderingCommand {
	var frame []RenderingCommand
	for {
		select {
		case frameRaw := <-w.events.renderingCommandsIn:
			frame = frameRaw
			break
		default:
			return frame
		}
	}
}

func renderCommands(window *pixelgl.Window, target pixel.Target, atlas *text.Atlas, matrix pixel.Matrix, frame []RenderingCommand) {
	if len(frame) == 0 {
		return
	}
	for _, command := range frame {
		command.render(window, target, atlas, matrix)
	}
}

func (command *RenderingCommand) render(window *pixelgl.Window, target pixel.Target, atlas *text.Atlas, matrix pixel.Matrix) {
	switch command.command {
	case Clear:
		if target == window {
			window.Clear(colornames.Black)
		} else {
			panic("rendertarget not supported")
		}
		return
	case ClearColour:
		if target == window {
			window.Clear(command.colour)
		} else {
			panic("rendertarget not supported")
		}
		return

	case Origin:
		renderCommands(window, target, atlas, matrix.Moved(pixel.V(command.location.X, command.location.Y)), command.children)
		return

	case Scale:
		renderCommands(window, target, atlas, matrix.ScaledXY(pixel.V(0, 0), pixel.V(command.location.X, command.location.Y)), command.children)
		return

	case Rotate:
		renderCommands(window, target, atlas, matrix.Rotated(pixel.V(0, 0), command.angle), command.children)
		return

	case DrawPolygon:
		imd := imdraw.New(nil)
		imd.SetMatrix(matrix)
		imd.Color = command.colour
		for _, point := range command.points {
			imd.Push(pixel.V(point.X, point.Y))
		}
		imd.Polygon(0)
		imd.Line(0)
		imd.Draw(target)
		return

	case DrawCircle:
		imd := imdraw.New(nil)
		imd.SetMatrix(matrix)
		imd.Color = command.colour
		imd.Push(pixel.V(command.location.X, command.location.Y))
		imd.Circle(command.radius, 0)
		imd.Draw(target)
		return

	case DrawRectangle:
		imd := imdraw.New(nil)
		imd.SetMatrix(matrix)
		imd.Color = command.colour
		imd.Push(pixel.V(command.location.X, command.location.Y))
		imd.Push(pixel.V(command.location.X+command.width, command.location.Y))
		imd.Push(pixel.V(command.location.X+command.width, command.location.Y+command.height))
		imd.Push(pixel.V(command.location.X, command.location.Y+command.height))
		imd.Polygon(0)
		return

	case DrawText:
		basicTxt := text.New(command.location, atlas)
		fmt.Fprintln(basicTxt, command.text)
		basicTxt.Draw(target, matrix)
		return

	case RenderTarget:
		panic("rendertarget is not supported")
	}
}
