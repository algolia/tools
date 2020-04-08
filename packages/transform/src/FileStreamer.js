export default function (file, finishCallBack) {
    const chunkSize = 1024 * 1024;
    let start = 0;
    let finished = false;
    let paused = false;
    let callback = () => {};

    this.pause = () => {
        paused = true;
    };

    this.resume = () => {
        paused = false;
        this.nextChunk();
    };

    this.chunkLoaded = (event) => {
        start += chunkSize;
        finished = !chunkSize || start >= file.size;

        callback(event.target.result);
        this.nextChunk();
    };

    this.readChunk = () => {
        if (paused) return;

        let input = file;
        if (chunkSize)
        {
            const end = Math.min(start + chunkSize, file.size);
            input = input.slice(start, end);
        }
        reader.readAsText(input, 'UTF-8');
    };

    this.nextChunk = function () {
        if (!finished) {
            this.readChunk();
        } else {
            finishCallBack();
        }
    };

    this.start = function (c) {
        callback = c;
        this.nextChunk();
    };

    const reader = new FileReader();
    reader.onload = this.chunkLoaded;
    reader.onerror = () => {
        console.log('error');
    };
}
