const toArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  const ab = await blob.arrayBuffer();
  return ab;
};

export const compressText = async (text: string): Promise<ArrayBuffer> => {
  if (typeof (globalThis as any).CompressionStream !== 'undefined') {
    const cs = new (globalThis as any).CompressionStream('gzip');
    const stream = new Blob([text]).stream().pipeThrough(cs);
    const out = await new Response(stream).blob();
    return toArrayBuffer(out);
  }
  const fallback = new TextEncoder().encode(text);
  return fallback.buffer;
};

export const decompressToText = async (data: ArrayBuffer): Promise<string> => {
  if (typeof (globalThis as any).DecompressionStream !== 'undefined') {
    const ds = new (globalThis as any).DecompressionStream('gzip');
    const stream = new Blob([data]).stream().pipeThrough(ds);
    const out = await new Response(stream).text();
    return out;
  }
  const text = new TextDecoder().decode(new Uint8Array(data));
  return text;
};
