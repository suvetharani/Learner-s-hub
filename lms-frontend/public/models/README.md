## Face-api models required (put files in this folder)

Your `FaceMonitor` loads models from `public/models` (served as `/models`).

If these files are missing OR empty, face detection will not work and you'll see errors like:
`Failed to execute 'json' on 'Response': Unexpected end of JSON input`.

### 1) Tiny Face Detector (required)

Place these files here:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1` (and any additional `-shardN` files if your download includes them)

### 2) Face Landmark 68 Tiny (required for "look left/right" + "look down")

Place these files here:

- `face_landmark_68_tiny_model-weights_manifest.json`
- `face_landmark_68_tiny_model-shard1` (and any additional `-shardN` files if your download includes them)

### Download source

Download the model files from the official `face-api.js` weights and copy them into this folder.
After copying, restart the frontend dev server.

