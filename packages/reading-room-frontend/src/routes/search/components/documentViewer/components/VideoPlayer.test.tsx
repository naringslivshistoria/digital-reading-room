import { describe, expect, it } from 'vitest'
// `screen` is re-exported from @testing-library/dom, which the import
// resolver cannot follow through pnpm's linked node_modules.
// eslint-disable-next-line import/named
import { fireEvent, render, screen } from '@testing-library/react'

import { VideoPlayer } from './VideoPlayer'

const file = { url: 'http://localhost/api/document/1/attachment/0' }

describe('VideoPlayer', () => {
  it('shows an error message when the video element fails', () => {
    const { container } = render(<VideoPlayer file={file} />)

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const video = container.querySelector('video') as HTMLVideoElement
    fireEvent.error(video)

    expect(screen.getByText(/Filen kunde inte spelas upp/)).toBeInTheDocument()
  })

  it('shows an error message when the source element fails', () => {
    const { container } = render(<VideoPlayer file={file} />)

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const source = container.querySelector('source') as HTMLSourceElement
    fireEvent.error(source)

    expect(screen.getByText(/Filen kunde inte spelas upp/)).toBeInTheDocument()
  })
})
