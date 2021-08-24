export const downSampleBuffer = (buffer, sampleRate, outSampleRate) => {
    if (outSampleRate === sampleRate) return buffer;
    if (outSampleRate > sampleRate)
        throw "downsampling rate should be smaller than original sample rate";
    const sampleRateRatio = sampleRate / outSampleRate;
    let result = new Int16Array(Math.round(buffer.length / sampleRateRatio));
    let offsetResult = 0,
        offsetBuffer = 0;

    while (offsetResult < result.length) {
        let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0,
            count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
};