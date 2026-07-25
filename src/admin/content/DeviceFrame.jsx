import { DEVICES } from './devices';

function Phone({ scale, children }) {
  const { width, height } = DEVICES.mobile;
  const bezel = 12;

  return (
    <div
      className="relative shrink-0 rounded-[3.2rem] bg-neutral-900 p-3 shadow-[0_18px_50px_-16px_rgba(15,43,92,0.55)] ring-1 ring-black/20"
      style={{ width: width * scale + bezel * 2, height: height * scale + bezel * 2 }}
    >
      <div dir="ltr" className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-neutral-950">
        {/* Dynamic island */}
        <div className="absolute top-2 left-1/2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>

      {/* Side buttons */}
      <span className="absolute top-24 -left-[3px] h-10 w-[3px] rounded-l bg-neutral-700" />
      <span className="absolute top-38 -left-[3px] h-14 w-[3px] rounded-l bg-neutral-700" />
      <span className="absolute top-28 -right-[3px] h-20 w-[3px] rounded-r bg-neutral-700" />
    </div>
  );
}

function Monitor({ scale, children }) {
  const { width, height } = DEVICES.desktop;
  const bezel = 10;

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        className="rounded-2xl bg-neutral-900 p-2.5 pb-4 shadow-[0_18px_50px_-16px_rgba(15,43,92,0.55)] ring-1 ring-black/20"
        style={{ width: width * scale + bezel * 2 }}
      >
        <div
          dir="ltr"
          className="relative overflow-hidden rounded-lg bg-neutral-950"
          style={{ height: height * scale }}
        >
          {children}
        </div>
      </div>
      <div className="h-4 w-16 bg-neutral-800" />
      <div className="h-1.5 w-32 rounded-b-lg bg-neutral-700" />
    </div>
  );
}

/**
 * Renders children inside a device shell at the given scale. The scaled page is
 * always laid out at its true pixel width, so what is shown is a real
 * viewport rather than a narrow page.
 */
export default function DeviceFrame({ device, scale, children }) {
  const { width, height } = DEVICES[device];

  const screen = (
    <div
      dir="ltr"
      className="preview-screen"
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  );

  return device === 'mobile' ? (
    <Phone scale={scale}>{screen}</Phone>
  ) : (
    <Monitor scale={scale}>{screen}</Monitor>
  );
}
