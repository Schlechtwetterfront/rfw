export function timeoutPromise(t = 0): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => resolve(), t);
    });
}
