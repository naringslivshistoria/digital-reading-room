Detailed Flow

1. Initialization Phase (lines 14-26, 28-47)

- Creates a scheduler (work queue manager)
- Spawns 5 parallel workers (NUM_WORKERS = 5)
- Each worker:
  - Loads Swedish language model ('swe')
  - Initializes with auto page segmentation mode
  - Gets added to the scheduler pool

2. Entry Point (lines 75-95)

Input: ArrayBuffer (file bytes) + type (MIME type string)

     Routing logic:

- \*.pdf → tryParsePdf()
- octet-stream → tryParsePdf() → fallback to tryParseImage()
- Other types → tryParseImage()

3. PDF Processing Path (lines 106-122)

tryParsePdf(fileData)
↓
convertToImages() ← Uses pdf2image library
↓
[Image 1, Image 2, ..., Image N]
↓
For each image:
↓
ocrImage(image.buffer)
↓
Concatenate all text

4. Image Processing Path (lines 97-104)

tryParseImage(type, fileData)
↓
ocrImage(fileData)
↓
Return text

5. Core OCR Processing (lines 53-65)

ocrImage(buffer)
↓
scheduler.addJob('recognize', buffer)
↓
[Tesseract worker processes image]
↓
Extract text from result
↓
Remove hyphenation (replaces '-\n' with '')
↓
Return cleaned text

Key Technical Details

Worker Pool Pattern:

- 5 concurrent workers process images in parallel
- Scheduler distributes jobs across available workers
- Efficient for multi-page PDFs

PDF Conversion Settings (lines 68-72):

- Converts each PDF page to a high-resolution image
- Width: 3000px, Height: 3000px, Scale: 2x
- Higher resolution = better OCR accuracy

Language Configuration (line 7):

- Currently uses only Swedish ('swe')
- English is commented out (/_"eng",_/)

Post-processing (line 61):

- Removes hyphenation: 'word-\nbreak' → 'wordbreak'
- Handles words split across lines

Data Transformations

PDF File (ArrayBuffer)
→ Uint8Array
→ Images (via pdf2image)
→ Individual image buffers
→ Tesseract recognition
→ Raw text with metadata
→ Cleaned text (string)

Image File (ArrayBuffer)
→ Direct to Tesseract
→ Raw text with metadata
→ Cleaned text (string)

The pipeline is essentially a parallelized OCR system where the scheduler manages multiple Tesseract workers to process documents efficiently, with special handling for PDFs that need to be converted to images first.
