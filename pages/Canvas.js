import React, { useRef, useEffect } from 'react'

const Canvas = (props) => {
  const canvasRef = useRef(null)

  const draw = async () => {
    const canvas = canvasRef.current
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d'),
      data = ctx.createImageData(256, 128)

    let colors = new Int16Array(32768)

    for (let i = 0; i < 32768; i++) colors[i] = i

    for (let j, i = 32767; i >= 0; i--) {
      j = (Math.random() * (i + 1)) | 0
      ;[colors[i], colors[j]] = [colors[j], colors[i]]
    }

    let unused = [...colors],
      pixels = new Int16Array(32768).fill(-1)

    const findColor =  (colorOne, colorTwo = -1) => {
      let colorDist = (from, to) => {
        let red = Math.abs(((from & 31744) >> 10) - ((to & 31744) >> 10)),
          green = Math.abs(((from & 992) >> 5) - ((to & 992) >> 5)),
          blue = Math.abs((from & 31) - (to & 31))

        return red + green + blue
      }

      let max = [0, Infinity]

      for (let d, i = 0; i < unused.length; i++) {
        d =
          colorDist(colorOne, unused[i]) +
          (colorTwo != -1 ? colorDist(colorTwo, unused[i]) : 0) +
          ((Math.random() * 12) | 0)

        if (d <= max[1]) max = [i, d]
      }

      let color = unused[max[0]]
      unused = unused.filter((u) => u != color)
      return color
    }

    const toHex = (notHex) => {
      let red = ((notHex & 31744) >> 7).toString(16).padStart(2, '0'),
        green = ((notHex & 992) >> 2).toString(16).padStart(2, '0'),
        blue = ((notHex & 31) << 3).toString(16).padStart(2, '0')
      return '#' + red + green + blue
    }

    ctx.fillStyle = toHex(
      (pixels[0] = findColor((Math.random() * 32768) | 0))
    )
    ctx.fillRect(0, 0, 1, 1)

    for (let i = 1; i < 128; i++) {
      ctx.fillStyle = toHex(
        (pixels[i * 256] = findColor(pixels[(i - 1) * 256]))
      )
      ctx.fillRect(0, i, 1, 1)
    }

    await new Promise((resolve) => setTimeout(resolve, 0))

    for (let i = 1; i < 256; i++) {
      ctx.fillStyle = toHex((pixels[i] = findColor(pixels[i - 1])))
      ctx.fillRect(i, 0, 1, 1)

      for (let j = 1; j < 128; j++) {
        ctx.fillStyle = toHex(
          (pixels[j * 256 + i] = findColor(
            pixels[j * 256 + (i - 1)],
            pixels[(j + 1) * 256 + i - 1]
          ))
        )
        ctx.fillRect(i, j, 1, 1)
      }

      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
  useEffect(() => {
    draw()
  }, [draw])
  return <canvas ref={canvasRef} {...props} />
}

export default Canvas
