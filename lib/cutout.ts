// Removes the background from a portrait, in the browser.
// A small person-finding model (MediaPipe Selfie Segmenter, Apache 2.0) marks which pixels are the person;
// everything else is made see-through. The photo never leaves the device.
// The engine and the model are served by this site from /vendor/mediapipe.

type Segmenter = {
  segment: (image: HTMLImageElement) => { confidenceMasks?: { getAsFloat32Array: () => Float32Array; width: number; height: number; close: () => void }[] };
};

let ready: Promise<Segmenter> | null = null;

function load(): Promise<Segmenter> {
  if (!ready) {
    ready = import("@mediapipe/tasks-vision")
      .then(async ({ FilesetResolver, ImageSegmenter }) => {
        const files = await FilesetResolver.forVisionTasks("/vendor/mediapipe/wasm");
        return (await ImageSegmenter.createFromOptions(files, {
          baseOptions: { modelAssetPath: "/vendor/mediapipe/selfie_segmenter.tflite", delegate: "CPU" },
          runningMode: "IMAGE",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        })) as unknown as Segmenter;
      })
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the photo"));
    img.src = src;
  });
}

// Returns the same picture as a PNG with a see-through background.
export async function removeBackground(photo: string): Promise<string> {
  const [segmenter, img] = await Promise.all([load(), loadImage(photo)]);
  const masks = segmenter.segment(img).confidenceMasks;
  if (!masks || !masks.length) throw new Error("No person found");
  // The last mask is the person.
  const mask = masks[masks.length - 1];
  const confidence = mask.getAsFloat32Array();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let kept = 0;
  for (let y = 0; y < canvas.height; y++) {
    // The mask can be a different size from the photo, so each pixel looks up its nearest mask point.
    const my = Math.min(mask.height - 1, Math.floor((y / canvas.height) * mask.height));
    for (let x = 0; x < canvas.width; x++) {
      const mx = Math.min(mask.width - 1, Math.floor((x / canvas.width) * mask.width));
      const c = confidence[my * mask.width + mx];
      // A soft edge between "surely background" and "surely the person".
      const t = Math.max(0, Math.min(1, (c - 0.3) / 0.4));
      const alpha = t * t * (3 - 2 * t);
      if (alpha > 0.5) kept++;
      pixels.data[(y * canvas.width + x) * 4 + 3] = Math.round(alpha * 255);
    }
  }
  masks.forEach((m) => m.close());
  // Almost nothing or almost everything kept means the model found no clear person.
  const share = kept / (canvas.width * canvas.height);
  if (share < 0.04 || share > 0.97) throw new Error("No person found");

  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}
