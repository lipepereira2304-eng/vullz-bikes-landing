export function fluidBackgroundMarkup(): string {
  return /* html */ `
    <svg
      class="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      viewBox="0 0 1200 1600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="blob-yellow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f5c518" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#f5c518" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-gray" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#c7c7c7" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#c7c7c7" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-graylight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e9e9e9" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#e9e9e9" stop-opacity="0" />
        </radialGradient>
        <filter id="blob-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="70" />
        </filter>
      </defs>

      <g filter="url(#blob-blur)">
        <ellipse
          class="origin-center animate-blob-a"
          cx="220" cy="260" rx="360" ry="300"
          fill="url(#blob-yellow)"
        />
        <ellipse
          class="origin-center animate-blob-b"
          cx="980" cy="520" rx="420" ry="360"
          fill="url(#blob-graylight)"
        />
        <ellipse
          class="origin-center animate-blob-c"
          cx="560" cy="980" rx="460" ry="380"
          fill="url(#blob-gray)"
        />
        <ellipse
          class="origin-center animate-blob-b"
          cx="150" cy="1300" rx="320" ry="280"
          fill="url(#blob-yellow)"
        />
      </g>
    </svg>
  `;
}
